-- =============================================
-- SilverFit 커뮤니티 + 프로필 테이블 마이그레이션
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. profiles 테이블
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text not null default '사용자',
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- 2. posts 테이블
create table public.posts (
  id bigserial primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text not null default 'general' check (category in ('general', 'question', 'info')),
  is_notice boolean not null default false,
  view_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. comments 테이블
create table public.comments (
  id bigserial primary key,
  post_id bigint references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- 4. 인덱스
create index posts_category_idx on public.posts (category);
create index posts_created_at_idx on public.posts (created_at desc);
create index comments_post_id_idx on public.comments (post_id);

-- 5. RLS 활성화
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- 6. RLS 정책 — profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- 7. RLS 정책 — posts
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);
create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Authors can update own posts"
  on public.posts for update using (auth.uid() = author_id);
create policy "Authors can delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- 8. RLS 정책 — comments
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);
create policy "Authenticated users can create comments"
  on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Authors can delete own comments"
  on public.comments for delete using (auth.uid() = author_id);

-- 9. 조회수 증가 함수 (security definer로 RLS 우회)
create or replace function public.increment_view_count(row_id bigint)
returns void as $$
begin
  update public.posts set view_count = view_count + 1 where id = row_id;
end;
$$ language plpgsql security definer;

-- 10. 댓글 수 자동 업데이트 트리거
create or replace function public.update_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = comment_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.update_comment_count();

-- 11. 회원가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      '사용자'
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
