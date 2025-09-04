create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  premium_until date,
  created_at timestamptz default now()
);

create table if not exists health_metrics (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  date date not null,
  steps int,
  active_minutes int,
  sleep_hours numeric(4,2),
  sleep_quality int,
  hr_avg int,
  mood int,
  stress int,
  source text check (source in ('manual','apple','google')) default 'manual',
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists lifescores (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  date date not null,
  score int not null,
  trend_3d int,
  trend_7d int,
  flags jsonb default '{}',
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists suggestions (
  id bigserial primary key,
  key text unique not null,
  title text not null,
  short_copy text,
  category text,
  duration_sec int,
  difficulty int,
  tutorial jsonb default '{}'
);

create table if not exists user_suggestions (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  suggestion_id bigint references suggestions(id) on delete cascade,
  date date not null,
  reason jsonb default '{}',
  completed boolean default false,
  feedback_mood int,
  time_spent_sec int,
  created_at timestamptz default now()
);

create table if not exists events (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  type text not null,
  payload jsonb default '{}',
  created_at timestamptz default now()
);
