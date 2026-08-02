# frontend — 북클럽 로그 웹

Next.js 16 (App Router) + TypeScript + MUI. 서비스 화면과 운영자 화면을 함께 담습니다.

> 심사·실행은 저장소 루트의 [README](../README.md)를 보세요 — `docker compose up --build` 하나로 전부 뜹니다.
> 이 문서는 **이 앱만 따로 개발할 때** 필요한 것만 담습니다.

## 로컬 개발

백엔드가 먼저 떠 있어야 합니다 (`backend/README.md` 참고).

```bash
npm install
npm run dev     # http://localhost:3000
```

API 주소는 `NEXT_PUBLIC_API_URL`로 바꿉니다 (기본값 `http://localhost:4000`).

> 이 값은 **빌드 시점에 번들로 들어갑니다.** 도커에서 백엔드 포트를 바꿀 때 `--build`가 필요한 이유입니다 (루트 README §2).

| 명령 | 용도 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 — **기능 단위가 끝날 때마다 한 번 돌립니다** |
| `npm run codegen` | 백엔드 `openapi.json` → `shared/types/api.generated.ts` |
| `npm run lint` / `npm run format` | ESLint / Prettier |

**타입체크·lint만으로는 부족합니다.** App Router의 Suspense 요구처럼 프레임워크 규칙은 타입 시스템 밖에 있어서, 정적 검사를 통과하고도 프로덕션 빌드에서 터진 적이 있습니다 (`../docs/AI_LOG.md`).

## 구조

```
src/
├── app/           # 라우트 — 페이지 전용 컴포넌트는 해당 폴더 하위 components/에 co-location
│   ├── page.tsx   # 서비스 소개 랜딩 — 로그인·모임 시작 진입점
│   ├── bookshelf/ books/ orders/new/ my/
│   ├── admin/     # 운영자 — orders · members · clubs
│   └── not-found.tsx · error.tsx
└── shared/
    ├── api/       # axiosClient + 도메인별 훅 (TanStack Query)
    ├── components/ui/  # Common* 공통 컴포넌트
    ├── stores/    # Zustand — 세션·토스트·운영자 필터
    ├── styles/    # colorChips 토큰 · MUI 테마
    └── types/     # codegen 결과를 도메인별로 재노출
```

## 이 앱에서 지키는 것

- **서버 상태는 TanStack Query, 클라이언트 상태는 Zustand.** 성격이 다른 것을 한 저장소에 섞지 않습니다
- **API 호출은 `shared/api/axiosClient`만** — `X-Member-Id` 자동 첨부, 전역 에러 토스트(인라인 표시가 필요하면 `skipErrorToast`)
- **색은 `shared/styles/colors.ts`의 `colorChips`만** 씁니다 (임의 hex 금지). 텍스트는 `Typo` + 타이포 토큰
- **타입은 직접 쓰지 않고 생성합니다** — `shared/types/`의 도메인별 재노출 파일에서만 import (`api.generated` 직접 import·로컬 재정의 금지)
- **세로 여백은 `VerticalGap`(px 명시)** — margin으로 페이지 레벨 여백을 만들지 않습니다
- **한글 에러 메시지를 프론트에 두지 않습니다.** 서버가 준 `code`로 분기하고 `message`를 그대로 보여줍니다 — 카피가 두 벌이 되면 어긋납니다

## Next.js 16 주의

학습 자료·AI 제안이 이전 메이저(13\~15) 기준인 경우가 많습니다. 구현 전에 설치된 버전의 문서를 먼저 확인하세요.

```
node_modules/next/dist/docs/
```

MUI도 9에서 시스템 props(`mt`/`mb` 등)가 제거돼 `sx`를 씁니다. 같은 유형의 실수를 반복한 기록이 `../docs/AI_LOG.md`에 있습니다.
