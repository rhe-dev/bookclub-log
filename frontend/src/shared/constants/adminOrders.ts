/**
 * 운영자 목록 페이지 크기.
 *
 * API 모듈이 아니라 상수 모듈에 둔다 — 필터 스토어가 이 값을 쓰는데,
 * adminApi에서 값을 가져오면 `axiosClient → resetSession → adminFilterStore → adminApi`로
 * 런타임 순환 참조가 생긴다 (타입 임포트는 컴파일 시 지워져 문제가 없었다).
 */
export const ADMIN_ORDERS_PAGE_SIZE = 20;

/** 화면에서 고를 수 있는 표시 건수 */
export const ADMIN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
