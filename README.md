# Story Album

여행 사진을 시네마틱한 스크롤 기반 앨범으로 만들고 공유하는 웹 앱입니다.

## 주요 기능

- 최대 10장의 사진 업로드 및 드래그앤드롭 정렬
- 여행 타입(커플/친구/솔로/가족) 및 분위기 선택
- AI 기반 앨범 레이아웃 자동 생성 (Gemini API)
- 한 줄 일기 작성
- 시네마틱한 블록 기반 앨범 뷰어
- 링크 공유 기능

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Storage)
- **AI**: Google Gemini API (선택적)
- **Deploy**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.local.example .env.local
```

환경 변수를 설정합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key  # 선택적
```

### 3. Supabase 설정

#### 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 후 로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 후 생성

#### 테이블 생성
SQL Editor에서 `supabase/migrations/001_create_posts_table.sql` 내용을 실행합니다.

#### Storage 버킷 생성
1. Storage 탭에서 "New bucket" 클릭
2. 이름: `story-album`
3. Public bucket 체크
4. SQL Editor에서 Storage 정책 실행:

```sql
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'story-album');

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-album');
```

#### API 키 확인
Settings > API에서 Project URL과 anon public key를 복사합니다.

### 4. Gemini API 설정 (선택)

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. 발급된 키를 `.env.local`의 `GEMINI_API_KEY`에 설정

> Gemini API 키가 없어도 앱은 동작합니다. 템플릿 기반 레이아웃이 자동 적용됩니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인합니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 홈페이지
│   ├── create/page.tsx       # 앨범 생성
│   ├── p/[id]/page.tsx       # 앨범 뷰어
│   └── api/
│       ├── upload/           # 이미지 업로드
│       ├── generate-plan/    # 레이아웃 생성
│       └── create-post/      # 포스트 저장
├── components/
│   ├── ui/                   # 기본 UI 컴포넌트
│   ├── album/                # 앨범 블록 컴포넌트
│   └── ...                   # 폼 컴포넌트들
└── lib/
    ├── supabase/             # Supabase 클라이언트
    ├── types.ts              # TypeScript 타입
    ├── gemini.ts             # Gemini API
    └── plan-generator.ts     # 레이아웃 생성기
```

## 배포

### Vercel 배포

1. [Vercel](https://vercel.com)에서 프로젝트 import
2. 환경 변수 설정
3. Deploy

## 라이선스

MIT
