-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- USERS (Profile linked to Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  email text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEAMS (Tenants)
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEAM MEMBERS (Many-to-Many Users <-> Teams)
create type public.team_role as enum ('owner', 'admin', 'member');

create table public.team_members (
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  role public.team_role default 'member'::public.team_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (team_id, user_id)
);

-- CLIENTS
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  details jsonb default '{}'::jsonb, -- Additional structured info
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'active' not null, -- active, completed, archived
  drive_folder_id text, -- Google Drive Folder ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SERVICES (Catalog)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  description text,
  default_price numeric(10, 2) not null default 0,
  unit text default 'hour', -- hour, day, fixed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUOTES
create table public.quotes (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade not null, -- denormalized for easier query
  number text, -- Sequential ID (e.g., Q-0001)
  status text default 'draft' not null, -- draft, sent, accepted, rejected
  valid_until date,
  total_amount numeric(10, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUOTE ITEMS
create table public.quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references public.quotes(id) on delete cascade not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null default 0,
  amount numeric(10, 2) not null default 0, -- calculated
  order_index int default 0
);

-- INVOICES
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  quote_id uuid references public.quotes(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade not null,
  number text not null, -- Canonical invoice number (e.g. INV-2024-001)
  status text default 'draft' not null, -- draft, sent, paid, overdue
  issue_date date not null default CURRENT_DATE,
  due_date date,
  total_amount numeric(10, 2) default 0,
  pdf_url text, -- Link to generated PDF in storage/drive
  drive_file_id text, -- ID in Google Drive
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (team_id, number) -- Ensure unique invoice numbers per team
);

-- INVOICE ITEMS
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(10, 2) not null default 0,
  amount numeric(10, 2) not null default 0,
  order_index int default 0
);

-- ACTIVITY LOGS (Traçabilité)
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  entity_type text not null, -- invoice, quote, etc.
  entity_id uuid not null,
  action text not null, -- created, updated, sent, paid
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ROW LEVEL SECURITY (RLS)

alter table public.users enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.activity_logs enable row level security;

-- USERS POLICIES
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- TEAMS POLICIES
create policy "Members can view their teams" on public.teams
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Users can create teams" on public.teams
  for insert with check (true);

-- TEAM MEMBERS POLICIES
create policy "Members can view team members" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
    or user_id = auth.uid()
  );

-- GENERIC RLS HELPER FUNCTION
-- Checks if current user is a member of the given team_id
create or replace function public.is_team_member(team_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.team_members
    where team_members.team_id = $1
    and team_members.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- CLIENTS POLICIES
create policy "Team members can view clients" on public.clients
  for select using (public.is_team_member(team_id));

create policy "Team members can manage clients" on public.clients
  for all using (public.is_team_member(team_id));

-- PROJECTS POLICIES
create policy "Team members can view projects" on public.projects
  for select using (public.is_team_member(team_id));

create policy "Team members can manage projects" on public.projects
  for all using (public.is_team_member(team_id));

-- SERVICES POLICIES
create policy "Team members can view services" on public.services
  for select using (public.is_team_member(team_id));

create policy "Team members can manage services" on public.services
  for all using (public.is_team_member(team_id));

-- QUOTES POLICIES
create policy "Team members can view quotes" on public.quotes
  for select using (public.is_team_member(team_id));

create policy "Team members can manage quotes" on public.quotes
  for all using (public.is_team_member(team_id));

-- INVOICES POLICIES
create policy "Team members can view invoices" on public.invoices
  for select using (public.is_team_member(team_id));

create policy "Team members can manage invoices" on public.invoices
  for all using (public.is_team_member(team_id));

-- ITEMS POLICIES (Cascade via parent? No, select directly linked to team capable tables usually safer, but via join is ok)
-- For items, simple check: user part of the team of the quote/invoice
-- NOTE: quote_items doesn't have team_id directly, must join.
-- To simplify RLS, we can add team_id to items or do a join check.
-- Let's go with join check for correctness without denormalizing too much, or use RLS on parent only if accessed via parent? No, need direct access.
-- Adding team_id to items is safer for RLS performance but redundant.
-- Let's stick to JOIN logic with security definer helpers if needed, or just using exists.

create policy "Team members can view quote items" on public.quote_items
  for select using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_items.quote_id
      and public.is_team_member(quotes.team_id)
    )
  );

create policy "Team members can manage quote items" on public.quote_items
  for all using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_items.quote_id
      and public.is_team_member(quotes.team_id)
    )
  );

create policy "Team members can view invoice items" on public.invoice_items
  for select using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and public.is_team_member(invoices.team_id)
    )
  );

create policy "Team members can manage invoice items" on public.invoice_items
  for all using (
    exists (
      select 1 from public.invoices
      where invoices.id = invoice_items.invoice_id
      and public.is_team_member(invoices.team_id)
    )
  );
