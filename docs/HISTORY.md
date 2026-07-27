# 작업 히스토리

> 최신이 위. 형식: 날짜 — 무엇을, 왜(필요 시), 특이사항.

## 2026-07-27

- 백엔드 앱 분리(D-023): src/apps/apis(서비스)·src/apps/admin(운영자) + src/shared(공유) 구조로 재편. 주문은 공통 로직(전이 실행·페이지네이션·매퍼)을 shared/orders의 OrdersSharedService로 두고 앱별 서비스는 역할별 유스케이스만. prisma 모듈도 shared로 이동. 라우트·스펙 변화 없음(빌드·테스트 25개 재통과).
- Lv2 Order API: 전이 맵 단일 소스(order-transitions.ts) + 순수 함수 검증 → 유닛 테스트 24개(순방향·역행·건너뛰기·권한·종결). 주문 생성(수록 책 검증·최초 이력)·내 주문·관리자 목록·주문자/관리자 전이 분리(/orders vs /admin/orders)·CSV(BOM+한글 라벨). 시드 주문 3건(완결·배송중·접수). curl 8개 시나리오 검증.
- 루트 레이아웃 공통화: AppShell(Header+main+Footer, sticky footer)을 루트 레이아웃에 배치하고 페이지별 Header 렌더 제거. Footer 신규 — 로고·서비스 소개·사업자 정보 플레이스홀더·카피라이트, 반응형 여백(링크 컬럼은 범위 제외).
- 리팩토링(커밋 전 자체 리뷰): 중복 추출 — MemberAvatar(4곳)·ErrorView(3곳)·BookCover(4곳)·BookSchedule(2곳)·useRequireMember 훅(2곳)·lineClamp 믹스인·백엔드 memberSummarySelect 공통화. BookStatusTag를 shared/components/book으로 이동(크로스 라우트 import 해소), 중복 import 정리.
- 코멘트 공감 기능(D-021): CommentLike 스키마+마이그레이션, 토글 API(POST /comments/:id/like), 응답에 likeCount·likedByMe(조회 헤더 선택적), 시드 공감 31개. UI는 하트 토글.
- 토론 UX 개선(사용자 피드백): 코멘트 기본 최신순 정렬(답글은 대화 순서 유지), 작성 인풋 최대 300px 후 스크롤, 인용 입력 textarea化(4줄 캡), 컴포저 카드 라운드를 인풋과 동일(10px)하게 정합.
- 책 상세(토론) 구현: 책 정보 카드(서지·일정·참여 아바타) + 모임장 관리 메뉴(수정 모달 재사용·삭제 확인) + 토론 스레드 — 코멘트 작성 폼(페이지·인용 앵커 접이식), 답글 인라인 작성, 작성자만 수정(인라인)·삭제(확인 모달, 자리 유지 안내), '삭제된 코멘트' 표시, 수정됨 표기. BookFormModal을 shared/components/book으로 승격(추가/수정 겸용). commentApi 훅 신설.
- 코드젠이 프-백 타입 어긋남을 실제로 검출: @nestjs/mapped-types의 PartialType은 Swagger 플러그인이 추론 못 해 Update DTO가 빈 스키마 → @nestjs/swagger의 PartialType으로 교체해 해결(검증 제약까지 스펙에 반영됨).
- 책방(홈) 구현: '지금 읽는 책' 히어로 카드(일정·참여 아바타·코멘트 수) + 우리 책장 그리드(2/3/4열 반응형) + 상태 필터 칩(서버 필터) + 책 추가 모달(서지·표지 색/이모지 피커·상태·일정·참여 회원 칩, 모임장만) + 빈 책방 온보딩(역할별 문구) + 스켈레톤·재시도. bookApi 훅·상태 라벨·날짜 유틸·MemberAvatarGroup 신설. 책 상세 스텁 라우트 추가, 미선택 접근 가드(입장 화면으로).
- 입장 화면을 /entry 라우트로 분리(루트 /는 리다이렉트 전용), EntrySkeleton을 라우트 하위 components/로 파일 분리 — 페이지 전용 컴포넌트 co-location 컨벤션 등재.
- CommonContainer(layout) 신설 — Stack 기반, 가운데 정렬 + 양옆 패딩 20px 고정, maxWidth prop. Header·입장·책방 스텁 모두 전환(MUI Container 직접 사용 금지 컨벤션). 루트 레이아웃 Header+Footer 공통화는 TODO 등록.
- 입장 화면 구현: 서비스 한 줄 소개 + 모임 카드(이름·소개·멤버 수) + 프로필 그리드(아바타·이름·모임장 뱃지) → 선택 시 멤버 저장 후 책방 이동. 이미 입장한 멤버는 자동 리다이렉트. 로딩 스켈레톤·실패 재시도 포함(QA 루브릭 ①③). 책방 스텁 라우트, clubApi 쿼리 훅·queryKeys 신설. 임시 쇼케이스 제거.
- 공통 Header(shared/components/layout) — 로고+워드마크(책방 이동), 현재 멤버 칩(아바타·이름·모임장 뱃지) + 멤버 변경 메뉴. 반응형: 모바일 56px/데스크탑 64px, 모바일은 아바타만 남기고 이름·역할은 메뉴 상단으로. 라우트 상수(shared/constants/routes.ts) 신설.
- 서비스 로고(logo.svg — 펼친 책 + 책갈피 리본, 팔레트 컬러) + 파비콘(favicon.ico·icon.svg) 제작, 스캐폴드 잔여 에셋 5종 정리, 메타데이터(타이틀 템플릿·OG) 업데이트.
- API 타입 codegen 구축(D-020): 백엔드에 Swagger 플러그인 + 응답 DTO 클래스(도메인별 *.response.ts) → `openapi:gen`으로 openapi.json 추출 → 프론트 `codegen`(openapi-typescript)으로 shared/types/api.generated.ts 생성 → 도메인 파일은 생성 타입 재노출로 전환. Swagger UI(/api/docs)도 함께 제공.
- 프론트 API 타입 체계(D-020): shared/types/ 도메인별 파일(common·member·club·book·comment)에 수동 정의, 사용처는 import 강제. memberStore도 타입 재사용으로 리팩터링. tertiary filled 톤 한 단계 진하게 조정.
- CommonButton에 tertiary(비강조 톤) 추가 — 연회색 fill + 서브틀 보더 + 진회색 텍스트(실측 기반, grayScale 토큰 매핑). filled/outlined 모두 지원.
- 토스트를 스택형 큐로 재구현: 새 토스트가 아래에 붙고 기존 토스트가 위로 쌓임. 다크 필 + 타입별 아이콘 원 + slideIn/Out 300ms, 수동 닫기 지원. 상태는 zustand 큐(toasts[] + isExiting).

## 2026-07-26

- 프론트 기반 세팅(D-019, 공통 부품 → 화면 순서): 스위트북 팔레트 실측(#2B6CB0·#B0662C) → 컬러·타이포 토큰 + Typo → MUI 9 테마(토큰 파생) → axiosClient(X-Member-Id 자동, 전역 에러 토스트) → memberStore·toastStore → CommonButton(3색×filled/outlined)·CommonInput·CommonModal·CommonToast → 쇼케이스 페이지로 검증. Pretendard 적용.
- 글자수 제한 조정: 코멘트 2,000→10,000자, 인용 500→1,000자 — 책 감상은 장문이 자연스럽고 그게 문집의 콘텐츠. 상한 자체는 유지(페이로드 방어·문집 조판·스레드 가독성).
- 코드 리뷰 반영: 전역 예외 필터 + ErrorMessage enum(D-018), 목록 API 페이지네이션(items+meta), 삭제 코멘트는 답글 있을 때만 자리 유지, null로 선택값(날짜·앵커) 해제, 빈 PATCH no-op, 기간 교차 검증. 기간 미입력 책 최상단 정렬은 '설정 미완 발견' 의도로 유지.
- 공통 코드 폴더 규칙(프/백 공통): src/shared/ 아래 기능 단위(dto·constants·filters) — backend common/ → shared/ 재편.
- Lv1 API 구현: Clubs(목록·멤버) / Books(목록+상태필터·등록·상세·수정·소프트 딜리트, 참여 회원 교체) / Comments(스레드 조회·작성·답글·수정·소프트 딜리트). PrismaService 전역 모듈, ValidationPipe(whitelist)·CORS·`/api` 프리픽스.
- 멤버 컨텍스트는 X-Member-Id 헤더, 권한(모임장·작성자)·스레드 규칙(답글 1단계, 삭제된 코멘트 답글 금지) 서버 검증 (D-017). 로컬 curl 14개 시나리오 + 도커 클린 기동 검증 완료.
- 주문 상태 최종 확정(D-013): 과제사 스위트북(POD 인쇄) 비즈니스 조사 후 '교환' 대신 '재제작(REMAKE_REQUESTED)' 채택 — 주문제작 상품은 단순 변심 환불·교환 없음, 하자 시 환불 또는 재제작. init 마이그레이션 재생성·클린 기동 재검증.
- 문서 배치 기준 확정(D-016: 전역은 루트 docs, 앱 국한은 앱 docs, 지엽 컨벤션 문서는 안 만듦). 프론트에 Prettier 추가 + format 스크립트, src 포맷 적용. 프/백 .prettierrc 동일 설정으로 통일(탭 2칸·80자·세미콜론·싱글쿼트·LF 등 명시).
- 스키마 구조 개편(사용자 결정 3건): 주문 상태에 취소·환불·재제작 분기 4개 추가(D-013), 노출 모델에 publicId(cuid) 도입(D-014), 회원-모임 다대다(Member 전역 + ClubMember)로 재구조화(D-015). init 마이그레이션 새로 생성, 시드·클린 기동 재검증 완료.
- 스키마를 도메인별 멀티 파일(prisma/schema/ — schema.prisma + 모델명 대문자 파일 Club·Member·Book·Comment·Order)로 분리. 전 모델·주요 필드에 /// 문서 주석(설계 근거 D-번호 연결 포함). VS Code Prisma 확장의 DATABASE_URL 경고는 루트 .env 추가로 해결(패키지 문제 아님).
- Prisma 스키마(PLAN §5 전체 모델) + init 마이그레이션 + 시드 완성: 모임 1, 멤버 6, 책 6(읽는 중 1·예정 1·완료 4), 코멘트·답글 38(수정 1·소프트 딜리트 1 사례 포함).
- 컨테이너 기동 시 migrate deploy → 시드(멱등, 데이터 있으면 스킵) → 앱 시작 자동화 (D-012). down -v 후 클린 기동으로 심사자 시나리오 검증 완료.
- 프론트 CLAUDE.md·AGENTS.md 삭제, Next 16 문서 참조 안내는 루트 CLAUDE.md 컨벤션으로 흡수.
- 모노레포 스캐폴드: frontend(Next 16.2, App Router, src 디렉터리) + backend(NestJS 11) 생성. 워크스페이스 없이 폴더 분리 (D-011).
- docker-compose 골격 완성: db(postgres:16-alpine, 헬스체크) + backend(:4000) + frontend(:3000) 3개 컨테이너 기동 확인. 포트·DB 접속정보는 .env로 오버라이드 가능(.env.example 제공).
- Dockerfile은 멀티스테이지 프로덕션 빌드(Next는 standalone 출력). NEXT_PUBLIC_API_URL은 빌드 아규먼트로 주입.

## 2026-07-25

- 프로젝트 시작. 주제를 '독서모임 기록 서비스(북클럽 로그)'로 확정 (D-001).
- 기획 문서 세트 작성: PLAN(타겟·플로우·화면·데이터모델·레벨 범위·비목표), DECISIONS, TODO(일정·작업), QA(루브릭 체크리스트), AI_LOG, CLAUDE.md(문서 라우팅·컨벤션).
- 기획 개정: 모임 책방 + 책 단위 토론 스레드(코멘트·답글, 페이지·인용 앵커) 중심으로 재편 (D-007). 마이페이지·관리자 화면 포함, 커뮤니티는 보류 (D-008).
- CLAUDE.md 문서 라우팅을 작업 도메인별로 세분화, 커밋 규칙(사용자 지시 시에만) 추가.
- 모델 구체화: 코멘트 수정·소프트 딜리트(D-010), 주문에 주문자 memberId 추가, 주문 상태 8단계 + 단계별 날짜 이력(D-009).
