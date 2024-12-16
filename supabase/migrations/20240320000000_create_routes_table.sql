-- Create routes table
create table public.routes (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    coordinates jsonb not null,
    likes integer default 0,
    dislikes integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id)
);

-- Enable Row Level Security
alter table public.routes enable row level security;

-- Create policies
create policy "Routes are viewable by everyone"
    on routes for select
    using (true);

create policy "Authenticated users can create routes"
    on routes for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own routes"
    on routes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own routes"
    on routes for delete
    using (auth.uid() = user_id);

-- Create votes table for managing likes/dislikes
create table public.votes (
    id uuid default gen_random_uuid() primary key,
    route_id uuid references public.routes(id) on delete cascade,
    user_id uuid references auth.users(id),
    is_like boolean not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(route_id, user_id)
);

-- Enable RLS for votes
alter table public.votes enable row level security;

-- Create policies for votes
create policy "Votes are viewable by everyone"
    on votes for select
    using (true);

create policy "Authenticated users can create votes"
    on votes for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own votes"
    on votes for update
    using (auth.uid() = user_id);

create policy "Users can delete their own votes"
    on votes for delete
    using (auth.uid() = user_id);

-- Create comments table
create table public.comments (
    id uuid default gen_random_uuid() primary key,
    route_id uuid references public.routes(id) on delete cascade,
    user_id uuid references auth.users(id),
    text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- Create policies for comments
create policy "Comments are viewable by everyone"
    on comments for select
    using (true);

create policy "Authenticated users can create comments"
    on comments for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own comments"
    on comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on comments for delete
    using (auth.uid() = user_id);