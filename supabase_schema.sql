-- Create the flowlearn_courses table to store classes created by instructors
create table if not exists flowlearn_courses (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    nodes jsonb not null,
    edges jsonb not null,
    lessons jsonb default '[]'::jsonb,
    media jsonb default '{}'::jsonb,
    simulation_events jsonb default '[]'::jsonb,
    created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table flowlearn_courses enable row level security;

-- Drop policies if they exist (to allow safe re-runs)
drop policy if exists "Allow public read access" on flowlearn_courses;
drop policy if exists "Allow public insert access" on flowlearn_courses;
drop policy if exists "Allow public update access" on flowlearn_courses;
drop policy if exists "Allow public delete access" on flowlearn_courses;

-- Create policies for public access (lecturers can post/edit/delete, students can read)
create policy "Allow public read access" on flowlearn_courses
    for select using (true);

create policy "Allow public insert access" on flowlearn_courses
    for insert with check (true);

create policy "Allow public update access" on flowlearn_courses
    for update using (true) with check (true);

create policy "Allow public delete access" on flowlearn_courses
    for delete using (true);
