-- Trigger function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_team_id uuid;
begin
  -- 1. Create public user profile
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 2. Create a default "Personal" team
  insert into public.teams (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', 'My Team') || '''s Team',
    lower(regexp_replace(new.email, '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(md5(random()::text) from 1 for 4)
  )
  returning id into new_team_id;

  -- 3. Add user as owner of the new team
  insert into public.team_members (team_id, user_id, role)
  values (new_team_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
