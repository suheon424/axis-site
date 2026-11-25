-- axis 방명록 Supabase 설정
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 을 누르세요. 한 번만 실행하면 돼요.

-- 1) 방명록 테이블
create table if not exists public.guestbook (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '익명' check (char_length(name) between 1 and 20),
  msg         text not null check (char_length(msg) between 1 and 80),
  photo_url   text check (photo_url is null or photo_url like 'https://mmhhibevzfbhjjuxkcul.supabase.co/storage/v1/object/public/guestbook/%'),
  owner_token uuid,
  created_at  timestamptz not null default now()
);

-- 2) 보안: 방문자는 읽기와 쓰기만 할 수 있어요. 삭제 열쇠(owner_token)는 읽을 수 없어요.
alter table public.guestbook enable row level security;
revoke all on public.guestbook from anon, authenticated;
grant select (id, name, msg, photo_url, created_at) on public.guestbook to anon, authenticated;
grant insert (id, name, msg, photo_url, owner_token) on public.guestbook to anon, authenticated;

drop policy if exists "guestbook read" on public.guestbook;
create policy "guestbook read" on public.guestbook for select to anon, authenticated using (true);
drop policy if exists "guestbook write" on public.guestbook;
create policy "guestbook write" on public.guestbook for insert to anon, authenticated with check (true);

-- 3) 삭제: 글을 쓴 브라우저가 가진 열쇠가 맞을 때만 지워져요.
create or replace function public.delete_guestbook_entry(p_id uuid, p_token uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  with d as (delete from public.guestbook where id = p_id and owner_token = p_token returning 1)
  select exists (select 1 from d);
$$;
revoke all on function public.delete_guestbook_entry(uuid, uuid) from public;
grant execute on function public.delete_guestbook_entry(uuid, uuid) to anon, authenticated;

-- 4) 사진 저장소: 누구나 볼 수 있고, 올리기만 가능해요 (jpg, 1MB 이하).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('guestbook', 'guestbook', true, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "guestbook upload" on storage.objects;
create policy "guestbook upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'guestbook');

-- 5) 예시 글 두 개
insert into public.guestbook (name, msg, created_at)
select * from (values
  ('익명', '계획이 틀어져도 다시 맞추면 된다는 말이 오늘 제일 큰 위로가 됐어요.', timestamptz '2026-11-21 10:00+09'),
  ('익명', '졸업 전시 축하해요! 큐브에서 시작한 로고 이야기가 정말 인상적이었어요.', timestamptz '2026-11-21 11:00+09')
) as v(name, msg, created_at)
where not exists (select 1 from public.guestbook);
