-- =============================================
-- 공지 기능 + 관리자 역할 추가
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. profiles에 role 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN role text NOT NULL DEFAULT 'user';

-- 2. posts에 is_notice 컬럼 추가
ALTER TABLE public.posts ADD COLUMN is_notice boolean NOT NULL DEFAULT false;

-- 3. 공지 조회용 인덱스
CREATE INDEX posts_is_notice_idx ON public.posts (is_notice) WHERE is_notice = true;

-- ※ 관리자 설정: 소셜 로그인 후 아래 쿼리로 본인 계정을 admin으로 변경
-- UPDATE public.profiles SET role = 'admin' WHERE id = '여기에-본인-user-id';
