-- v3: 스티커 & 그리기 기능 추가
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS stickers JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS drawings JSONB DEFAULT '[]';
