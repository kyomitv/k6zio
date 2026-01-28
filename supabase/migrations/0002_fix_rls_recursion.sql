-- Fix RLS policies to use the Security Definer function (bypassing recursion)

-- 1. Drop existing policies that might be problematic
drop policy if exists "Members can view their teams" on public.teams;
drop policy if exists "Members can view team members" on public.team_members;

-- 2. Re-create TEAMS policy using is_team_member (Security Definer)
create policy "Members can view their teams" on public.teams
  for select using (public.is_team_member(id));

-- 3. Re-create TEAM MEMBERS policy
-- "I can see rows if I am the user OR if I am a member of that team"
-- Using is_team_member avoids checking team_members table directly with user privileges
create policy "Members can view team members" on public.team_members
  for select using (
    user_id = auth.uid() 
    or public.is_team_member(team_id)
  );
