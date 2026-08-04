alter table public.biloo_profiles
  add column if not exists username text,
  add column if not exists first_name text,
  add column if not exists father_name text,
  add column if not exists grandfather_name text,
  add column if not exists region text,
  add column if not exists sub_city text,
  add column if not exists woreda text;

alter table public.biloo_profiles
  drop constraint if exists biloo_profiles_username_format,
  drop constraint if exists biloo_profiles_phone_et_format;

alter table public.biloo_profiles
  add constraint biloo_profiles_username_format
    check (
      username is null
      or username ~ '^[a-z][a-z0-9._]{2,29}$'
    ),
  add constraint biloo_profiles_phone_et_format
    check (
      phone is null
      or phone ~ '^\+251[79][0-9]{8}$'
    );

create unique index if not exists biloo_profiles_username_lower_uidx
  on public.biloo_profiles (lower(username))
  where username is not null;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_first_name text := nullif(trim(new.raw_user_meta_data ->> 'first_name'), '');
  v_father_name text := nullif(trim(new.raw_user_meta_data ->> 'father_name'), '');
  v_grandfather_name text := nullif(trim(new.raw_user_meta_data ->> 'grandfather_name'), '');
  v_display_name text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
  v_username text := lower(nullif(trim(new.raw_user_meta_data ->> 'username'), ''));
  v_phone text := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');
  v_region text := nullif(trim(new.raw_user_meta_data ->> 'region'), '');
  v_city text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'city'), ''), 'Addis Ababa');
  v_sub_city text := nullif(trim(new.raw_user_meta_data ->> 'sub_city'), '');
  v_woreda text := nullif(trim(new.raw_user_meta_data ->> 'woreda'), '');
begin
  if v_display_name is null then
    v_display_name := nullif(
      concat_ws(' ', v_first_name, v_father_name, v_grandfather_name),
      ''
    );
  end if;

  insert into public.biloo_profiles (
    id,
    role,
    display_name,
    username,
    first_name,
    father_name,
    grandfather_name,
    phone,
    email,
    region,
    city,
    sub_city,
    woreda
  )
  values (
    new.id,
    'customer',
    coalesce(v_display_name, 'BILOO member'),
    v_username,
    v_first_name,
    v_father_name,
    v_grandfather_name,
    v_phone,
    new.email,
    v_region,
    v_city,
    v_sub_city,
    v_woreda
  )
  on conflict (id) do update
  set display_name = coalesce(excluded.display_name, public.biloo_profiles.display_name),
      username = coalesce(excluded.username, public.biloo_profiles.username),
      first_name = coalesce(excluded.first_name, public.biloo_profiles.first_name),
      father_name = coalesce(excluded.father_name, public.biloo_profiles.father_name),
      grandfather_name = coalesce(excluded.grandfather_name, public.biloo_profiles.grandfather_name),
      phone = coalesce(excluded.phone, public.biloo_profiles.phone),
      email = excluded.email,
      region = coalesce(excluded.region, public.biloo_profiles.region),
      city = coalesce(excluded.city, public.biloo_profiles.city),
      sub_city = coalesce(excluded.sub_city, public.biloo_profiles.sub_city),
      woreda = coalesce(excluded.woreda, public.biloo_profiles.woreda),
      updated_at = now();

  return new;
exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'Username is already taken';
end;
$function$;

create or replace function public.is_biloo_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    lower(trim(candidate_username)) ~ '^[a-z][a-z0-9._]{2,29}$'
    and not exists (
      select 1
      from public.biloo_profiles
      where lower(username) = lower(trim(candidate_username))
    );
$function$;

revoke all on function public.is_biloo_username_available(text) from public;
grant execute on function public.is_biloo_username_available(text) to anon, authenticated;

comment on column public.biloo_profiles.username is
  'Unique lowercase BILOO username selected during customer registration.';
comment on function public.is_biloo_username_available(text) is
  'Returns only username availability for signup; final uniqueness is enforced by the profile index.';
