-- Story Album posts 테이블 생성
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT,
  type TEXT NOT NULL,
  moods TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  image_urls TEXT[] NOT NULL,
  edit_plan JSONB NOT NULL,
  user_texts JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true
);

-- 인덱스 생성
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_public ON posts(is_public);

-- RLS (Row Level Security) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 공개 포스트 읽기 정책
CREATE POLICY "Public read access"
ON posts FOR SELECT
USING (is_public = true);

-- 누구나 포스트 생성 가능 (MVP - 인증 없음)
CREATE POLICY "Public insert access"
ON posts FOR INSERT
WITH CHECK (true);

-- Storage 버킷 정책 (Supabase 대시보드에서 버킷 생성 후 SQL Editor에서 실행)
-- 버킷 이름: story-album
-- Public bucket: 체크

-- Storage 정책 (버킷 생성 후 실행)
-- CREATE POLICY "Public upload access"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'story-album');

-- CREATE POLICY "Public read access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'story-album');
