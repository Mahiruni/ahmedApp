alter table public.biloo_role_applications
  add column if not exists application_data jsonb not null default '{}'::jsonb;

alter table public.biloo_role_applications
  drop constraint if exists biloo_role_applications_application_data_object;

alter table public.biloo_role_applications
  add constraint biloo_role_applications_application_data_object
  check (jsonb_typeof(application_data) = 'object');

create index if not exists biloo_role_applications_status_created_idx
  on public.biloo_role_applications (status, created_at desc);

create or replace function private.review_biloo_role_application(
  p_application_id uuid,
  p_status public.biloo_role_application_status,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_reviewer uuid := (select auth.uid());
  v_application public.biloo_role_applications%rowtype;
  v_data jsonb;
  v_vehicle_type text;
  v_plate_number text;
  v_legal_name text;
  v_display_name text;
  v_service_type public.biloo_service_type;
  v_vendor_id uuid;
begin
  if v_reviewer is null or private.current_user_role() <> 'admin' then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Review status must be approved or rejected';
  end if;

  select *
  into v_application
  from public.biloo_role_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Role application not found';
  end if;

  if v_application.status <> 'pending' then
    raise exception 'Role application has already been reviewed';
  end if;

  v_data := coalesce(v_application.application_data, '{}'::jsonb);

  if p_status = 'approved' and v_application.requested_role = 'driver' then
    v_vehicle_type := nullif(trim(v_data ->> 'vehicle_type'), '');
    v_plate_number := upper(nullif(trim(v_data ->> 'plate_number'), ''));

    if v_vehicle_type is null or v_plate_number is null then
      raise exception 'Driver application is missing vehicle details';
    end if;
  elsif p_status = 'approved' and v_application.requested_role = 'vendor_owner' then
    v_legal_name := nullif(trim(v_data ->> 'legal_name'), '');
    v_display_name := nullif(trim(v_data ->> 'display_name'), '');

    if v_legal_name is null or v_display_name is null then
      raise exception 'Vendor application is missing business details';
    end if;

    if coalesce(v_data ->> 'service_type', '') not in ('food', 'market', 'construction', 'parts') then
      raise exception 'Vendor application has an invalid service type';
    end if;

    v_service_type := (v_data ->> 'service_type')::public.biloo_service_type;
  end if;

  update public.biloo_role_applications
  set status = p_status,
      notes = nullif(trim(p_notes), ''),
      reviewed_at = now(),
      reviewed_by = v_reviewer
  where id = p_application_id;

  if p_status = 'approved' then
    update public.biloo_profiles
    set role = v_application.requested_role,
        updated_at = now()
    where id = v_application.user_id;

    if v_application.requested_role = 'driver' then
      insert into public.biloo_driver_profiles (
        id,
        verification_status,
        vehicle_type,
        plate_number
      )
      values (
        v_application.user_id,
        'verified',
        v_vehicle_type,
        v_plate_number
      )
      on conflict (id) do update
      set verification_status = 'verified',
          vehicle_type = excluded.vehicle_type,
          plate_number = excluded.plate_number,
          updated_at = now();
    elsif v_application.requested_role = 'vendor_owner' then
      select id
      into v_vendor_id
      from public.biloo_vendors
      where owner_id = v_application.user_id
      order by created_at
      limit 1
      for update;

      if v_vendor_id is null then
        insert into public.biloo_vendors (
          owner_id,
          service_type,
          legal_name,
          display_name,
          verification_status,
          commission_rate
        )
        values (
          v_application.user_id,
          v_service_type,
          v_legal_name,
          v_display_name,
          'verified',
          0.12
        );
      else
        update public.biloo_vendors
        set service_type = v_service_type,
            legal_name = v_legal_name,
            display_name = v_display_name,
            verification_status = 'verified',
            updated_at = now()
        where id = v_vendor_id;
      end if;
    end if;
  end if;

  insert into public.biloo_notifications (
    recipient_id,
    title,
    message,
    payload
  )
  values (
    v_application.user_id,
    case when p_status = 'approved' then 'Role approved' else 'Application reviewed' end,
    case
      when p_status = 'approved'
        then 'Your BILOO ' || replace(v_application.requested_role::text, '_', ' ') || ' access is now active.'
      else 'Your role application was not approved. Open your account for details.'
    end,
    jsonb_build_object(
      'application_id', p_application_id,
      'status', p_status,
      'requested_role', v_application.requested_role
    )
  );

  insert into public.biloo_audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    context
  )
  values (
    v_reviewer,
    'role_application.reviewed',
    'role_application',
    p_application_id::text,
    jsonb_build_object(
      'status', p_status,
      'requested_role', v_application.requested_role,
      'activation_created', p_status = 'approved'
    )
  );
end;
$function$;

comment on column public.biloo_role_applications.application_data is
  'Applicant-supplied driver or vendor activation details reviewed by administrators.';
