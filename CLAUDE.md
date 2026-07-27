# 북클럽 로그 — Claude Code 작업 가이드

온라인 독서모임의 책방(아카이브) 서비스. 모임이 함께 읽은 책과 토론이 콘텐츠 본체, 모임 문집(실물 책) 제작이 부가 기능.

## 문서 라우팅 — 요청 작업의 도메인에 해당하는 문서만 읽는다

> 매 작업마다 모든 문서를 읽지 않는다. 아래 표에서 **이번 작업에 해당하는 행의 문서·섹션만** 읽는다.
> 이 표는 작업이 진행되며 계속 세분화한다.

| 작업 도메인 | 먼저 읽을 문서·섹션 |
|---|---|
| 책방 (책 등록·목록·상세 정보) | `docs/PLAN.md` §3 F1, §5 Book 모델 |
| 토론 (코멘트·답글) | `docs/PLAN.md` §3 F2, §5 Comment 모델 |
| 문집 주문·마이페이지 | `docs/PLAN.md` §3 F3, §5 주문 상태 규칙 + `docs/QA.md` "Lv2 로직 검증" |
| 관리자 (/admin) | `docs/PLAN.md` §3 F4 + `docs/QA.md` "Lv2 로직 검증" |
| 화면 문구·상태 표시·UX 판단 | `docs/QA.md` 루브릭 + `docs/PLAN.md` §2 페르소나 |
| 인프라 (Docker·시드) | `docs/TODO.md` 해당 항목 |
| 범위 판단이 애매할 때 | `docs/PLAN.md` §6 레벨 범위, §7 비목표 |
| 제출물 작성 (README·서술형·제출 요건 확인) | `docs/ASSIGNMENT_BRIEF.md` (로컬 전용, 커밋 금지) |
| 단순 수정 (오타·스타일·소규모 버그) | 문서 선행 없이 진행 |

## 작업 후 반드시 (문서 재반영)

1. `docs/HISTORY.md`에 작업 내역 1~3줄 추가
2. `docs/TODO.md` 체크 상태 갱신
3. 설계·UX 판단이 있었다면 `docs/DECISIONS.md`에 D-번호로 기록
4. AI 도구가 틀렸거나 삽질한 게 있으면 `docs/AI_LOG.md`에 즉시 기록

## 개발 실행 워크플로우

- **개발 중**: db만 도커(`docker compose up -d db`), 프/백은 로컬 dev 서버로 핫 리로드 — backend `npm run start:dev`(:4000), frontend `npm run dev`(:3000)
- **검증·제출 전**: `docker compose up --build`로 프로덕션 파리티 확인 (심사자 시나리오는 항상 도커 기준)
- 포트가 겹치므로 도커 프/백과 로컬 dev 서버는 동시에 켜지 않는다 (`docker compose stop frontend backend`)

## 커밋 규칙 (중요)

- **커밋은 사용자가 변경 내용을 직접 확인하고 지시했을 때만 실행한다. 임의로 커밋하지 않는다.**
- 작업 완료 시: 무엇이 바뀌었는지 요약해 보여주고 → 사용자 확인 → 커밋 지시가 있을 때만 커밋
- 커밋 메시지: `feat:` / `fix:` / `docs:` / `chore:` 접두어, **전체 3줄 이내로 간략하게**
- 커밋 author는 이 레포의 로컬 git 설정을 사용한다 (전역 설정 변경 금지)

## 컨벤션

- 프론트: 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand. 컴포넌트는 MUI 우선
- 프론트 디자인 토큰: 색상은 `shared/styles/colors.ts`의 colorChips만 사용(임의 hex 금지), 텍스트는 `Typo` 컴포넌트 + 타이포 토큰(text_{weight}_{size}). MUI 테마 팔레트도 colorChips에서 파생
- 프론트 공통 UI: `shared/components/ui/`의 Common* 컴포넌트(단일 .tsx, 배럴 없음) 우선 사용. 토스트는 `toast.success()/error()/info()` 전역 헬퍼. 페이지 콘텐츠 폭은 `CommonContainer`(양옆 패딩 20px 고정, maxWidth prop) 사용 — MUI Container 직접 사용 금지
- 프론트 API 호출: `shared/api/axiosClient`(get/post/patch/del 래퍼)만 사용 — X-Member-Id 자동 첨부, 전역 에러 토스트(인라인 표시는 skipErrorToast)
- 프론트 페이지 구조: 페이지 전용 컴포넌트는 해당 라우트 폴더 하위 `components/`에 co-location(로딩 스켈레톤도 별도 파일로 분리). 루트(`/`)는 리다이렉트 전용 — 실제 화면은 각자 경로를 가진다
- 프론트 API 타입은 codegen(D-020): 백엔드 DTO·컨트롤러 수정 → backend `npm run openapi:gen`(openapi.json 갱신) → frontend `npm run codegen`(shared/types/api.generated.ts 재생성). 사용처는 `shared/types/` 도메인별 재노출 파일(common·member·club·book·comment)에서만 import — 로컬 재정의·api.generated 직접 import 금지
- Next 16은 학습 데이터와 API·컨벤션이 다를 수 있음 — 프론트 구현 전 `frontend/node_modules/next/dist/docs/`의 해당 가이드를 먼저 확인
- 백엔드: Controller → Service → Prisma 레이어링, DTO 검증(class-validator)
- 주문 상태 전이는 반드시 서버에서 검증 — 순방향 8단계(접수→확인→제작→제작완료→배송시작→배송중→배송완료→구매확정) + 허용된 분기만: 취소(접수·확인에서, 주문자·관리자) / 환불요청(배송완료, 주문자)→환불완료(관리자) / 재제작요청(배송완료, 주문자)→제작 재진입(관리자). 종결: 구매확정·취소·환불완료. 주문제작 상품이라 단순 변심 환불·교환 없음 — 하자 시에만 (PLAN §5 전이 맵)
- API 경로·응답 식별자는 publicId(cuid)만 사용 — 내부 int id는 노출하지 않는다
- 삭제는 소프트 딜리트(deletedAt)가 기본 — Comment·Book 하드 딜리트 금지
- 문서 배치: 프/백 공통·기획·프로세스 문서는 루트 `docs/`, 한쪽 앱에만 해당하는 문서는 그 앱의 `docs/`(backend/docs 등)에 둔다. 지엽적 컨벤션 문서는 만들지 않는다 — 기존 코드가 컨벤션의 기준 (D-016)
- 폴더 구조(프/백 공통): 여러 도메인이 함께 쓰는 코드는 `src/shared/` 아래 기능 단위(dto·constants·filters·utils 등)로 배치. 도메인 폴더에는 그 도메인 전용 코드만
- 에러 처리(백): 사용자 노출 메시지는 `shared/constants/error-message.ts`의 ErrorMessage enum이 단일 소스 — 도메인 예외·DTO 검증 메시지 모두 여기서 가져온다. 응답 포맷은 전역 필터가 `{ statusCode, messages[], timestamp, path }`로 통일 (D-018)
- 목록 API는 페이지네이션 기본: `?page=&limit=`(기본 20, 최대 100) → `{ items, meta: { page, limit, totalCount, hasNext } }`

## 범위 규칙

- `docs/PLAN.md` §7 비목표에 있는 것은 구현하지 않는다 (제안도 하지 않는다)
- 새 기능 아이디어가 생기면 구현하지 말고 TODO의 "아이디어(보류)"에 적는다
- "Lv1 완성도 > Lv3 어설픔" — 폴리싱이 기능 추가보다 우선
