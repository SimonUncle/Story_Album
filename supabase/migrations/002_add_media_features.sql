-- Story Album v2: 미디어 기능 추가
-- 영상 지원, 브이로그 자막, 색감 필터

-- 새 컬럼 추가
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS media_items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS subtitles JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS filter TEXT DEFAULT 'none';

-- 컬럼 설명 추가
COMMENT ON COLUMN posts.media_items IS '미디어 아이템 배열 [{url, type: image|video, thumbnail?}]';
COMMENT ON COLUMN posts.subtitles IS '자막 배열 [{id, mediaIndex, text, position: {x, y}}]';
COMMENT ON COLUMN posts.filter IS '색감 필터: none, warm, film, mono';

-- 필터 타입 체크 (선택적)
-- ALTER TABLE posts ADD CONSTRAINT check_filter_type
--   CHECK (filter IN ('none', 'warm', 'film', 'mono'));
