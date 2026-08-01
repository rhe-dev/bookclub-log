# backend — 북클럽 로그 API

NestJS + Prisma + PostgreSQL. 서비스 API와 운영자 API를 한 프로세스에서 제공합니다.

> 심사·실행은 저장소 루트의 [README](../README.md)를 보세요 — `docker compose up --build` 하나로 전부 뜹니다.
> 이 문서는 **이 앱만 따로 개발할 때** 필요한 것만 담습니다.

## 로컬 개발

DB만 도커로 띄우고 앱은 로컬에서 돌립니다 (핫 리로드).

```bash
docker compose up -d db     # 저장소 루트에서
npm install
npx prisma migrate dev      # 스키마 반영 + 클라이언트 생성
npm run start:dev           # http://localhost:4000
```

`.env`에 DB 접속 문자열이 필요합니다. 루트 `.env.example`과 같은 기본값입니다.

```
DATABASE_URL="postgresql://bookclub:bookclub@localhost:5432/bookclub?schema=public"
```

시드는 `package.json`의 `prisma.seed`에 걸려 있어 `npx prisma db seed`로 넣습니다. **이미 데이터가 있으면 건너뛰므로** 여러 번 돌려도 중복되지 않습니다.

| 명령 | 용도 |
|---|---|
| `npm run start:dev` | 개발 서버 (watch) |
| `npm test` | 유닛 테스트 — 주문 전이 맵 검증이 여기 있습니다 |
| `npm run openapi:gen` | `openapi.json` 갱신 → 프론트 타입 생성의 입력 |
| `npx prisma studio` | DB 브라우저 |

API 문서(Swagger)는 실행 중 http://localhost:4000/api/docs 에서 볼 수 있습니다.

## 구조

```
src/
├── apps/
│   ├── apis/      # 서비스 API — books · comments · orders · clubs · members
│   └── admin/     # 운영자 API — orders · members · clubs
└── shared/        # 두 앱이 공유
    ├── bookprint/ # 북프린트 API 계약 재현 (판형·분량·검증·견적·목 클라이언트·상태 맵)
    ├── orders/    # 주문 전이 맵, 원고 산출
    ├── constants/ # ErrorCode enum + 한글 메시지 (에러 계약의 단일 소스)
    ├── filters/   # 전역 예외 필터
    └── prisma/
```

**`apis`와 `admin`을 나눈 이유**는 루트 README §5에 있습니다 — 한 DB를 공유하되 필요하면 서버를 분리할 수 있는 경계입니다.

Prisma 스키마는 `prisma/schema/`에 도메인별로 나눠 뒀습니다 (Club · Member · Book · Comment · Order).

## 이 앱에서 지키는 것

- **Controller → Service → Prisma** 레이어링, 요청 검증은 DTO(class-validator)에서
- **API에 내부 id를 노출하지 않습니다** — 경로·응답 식별자는 `publicId`(cuid)만
- **삭제는 소프트 딜리트**(`deletedAt`)가 기본 — Comment·Book 하드 딜리트 금지
- **주문 상태 전이는 서버에서 검증** — 전이 맵은 `shared/orders/`, 유닛 테스트가 상시 보장
- **에러는 코드로 던집니다** — 도메인 예외·DTO 검증 모두 `ErrorCode`를 던지고 전역 필터가 한글 메시지를 붙입니다. 프론트는 코드로 분기합니다
- **목록은 페이지네이션 기본** (`?page=&limit=` → `{ items, meta }`). 예외는 컨트롤러 주석에 근거를 남깁니다

## DTO를 고쳤다면

프론트 타입은 OpenAPI에서 생성됩니다. 응답·요청 모양을 바꿨으면 스펙부터 갱신하세요.

```bash
npm run openapi:gen                # backend/openapi.json 갱신
cd ../frontend && npm run codegen  # 프론트 타입 재생성
```

이 파이프라인이 프-백 계약 불일치를 빌드 단계에서 잡아 줍니다.
