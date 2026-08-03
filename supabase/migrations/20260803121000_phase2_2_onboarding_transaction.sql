create or replace function private.complete_biloo_onboarding(
  p_display_name text,
  p_phone text,
  p_city text,
  p_requested_role public.biloo_user_role,
  p_application_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_existing_status public.biloo_role_application_status;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if length(trim(coalesce(p_display_name, ''))) < 2 then
    raise exception 'Enter a valid display name';
  end if;

  if length(trim(coalesce(p_phone, ''))) < 7 then
    raise exception 'Enter a valid phone number';
  end if;

  if p_requested_role not in ('customer', 'driver', 'vendor_owner') then
    raise exception 'Unsupported onboarding role';
  end if;

  if jsonb_typeof(coalesce(p_application_data, '{}'::jsonb)) <> 'object' then
    raise exception 'Application data must be an object';
  end if;

  if p_requested_role = 'driver' then
    if nullif(trim(p_application_data ->> 'vehicle_type'), '') is null
      or nullif(trim(p_application_data ->> 'plate_number'), '') is null then
      raise exception 'Driver application requires vehicle type and plate number';
    end if;
  elsif p_requested_role = 'vendor_owner' then
    if nullif(trim(p_application_data ->> 'legal_name'), '') is null
      or nullif(trim(p_application_data ->> 'display_name'), '') is null then
      raise exception 'Vendor application requires business names';
    end if;

    if coalesce(p_application_data ->> 'service_type', '') not in ('food', 'market', 'construction', 'parts') then
      raise exception 'Vendor application has an invalid service type';
    end if;
  end if;

  if p_requested_role in ('driver', 'vendor_owner') then
    select status
    into v_existing_status
    from public.biloo_role_applications
    where user_id = v_user_id
      and requested_role = p_requested_role
    for update;

    if found and v_existing_status <> 'pending' then
      raise exception 'This role application has already been reviewed';
    end if;

    if found then
      update public.biloo_role_applications
      set application_data = p_application_data,
          notes = null,
          reviewed_at = null,
          reviewed_by = null
      where user_id = v_user_id
        and requested_role = p_requested_role;
    else
      insert into public.biloo_role_applications (
        user_id,
        requested_role,
        status,
        application_data
      )
      values (
        v_user_id,
        p_requested_role,
        'pending',
        p_application_data
      );
    end if;
  end if;

  update public.biloo_profiles
  set display_name = trim(p_display_name),
      phone = trim(p_phone),
      city = coalesce(nullif(trim(p_city), ''), 'Addis Ababa'),
      onboarding_completed_at = now(),
      updated_at = now()
  where id = v_user_id;

  if not found then
    raise exception 'BILOO profile not found';
  end if;
end;
$function$;

create or replace function public.complete_biloo_onboarding(
  p_display_name text,
  p_phone text,
  p_city text,
  p_requested_role public.biloo_user_role,
  p_application_data jsonb default '{}'::jsonb
)
returns void
language sql
set search_path = ''
as $function$
  select private.complete_biloo_onboarding(
    p_display_name,
    p_phone,
    p_city,
    p_requested_role,
    p_application_data
  );
$function$;

revoke all on function private.complete_biloo_onboarding(text, text, text, public.biloo_user_role, jsonb)
  from public, anon, authenticated;
revoke all on function public.complete_biloo_onboarding(text, text, text, public.biloo_user_role, jsonb)
  from public, anon;
grant execute on function public.complete_biloo_onboarding(text, text, text, public.biloo_user_role, jsonb)
  to authenticated;
