create table if not exists user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  notify_morning boolean default true,
  notify_evening boolean default false,
  preferred_time_morning time default '07:30',
  preferred_time_evening time default '21:30',
  tutorial_audio boolean default true,
  tutorial_vibration boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;
create policy "prefs self read"
on user_preferences for select
to authenticated
using (auth.uid() = user_id);
create policy "prefs self upsert"
on user_preferences for insert
to authenticated
with check (auth.uid() = user_id);
create policy "prefs self update"
on user_preferences for update
to authenticated
using (auth.uid() = user_id);
