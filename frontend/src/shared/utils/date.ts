/** ISO 문자열 → 'YYYY.MM.DD' */
export const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
};

/** ISO 문자열 → 'YYYY.MM.DD HH:mm' (코멘트 작성 시각용) */
export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(iso)} ${hh}:${mi}`;
};

/** 기간 표기 — 한쪽만 있어도 자연스럽게 */
export const formatPeriod = (
  from?: string | null,
  to?: string | null,
): string => {
  if (from && to) return `${formatDate(from)} ~ ${formatDate(to)}`;
  return formatDate(from) || formatDate(to);
};

/** ISO 문자열 → 'YY.MM.DD' (좁은 카드용) */
export const formatDateShort = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}.${mm}.${dd}`;
};

/** 축약 기간 — 같은 해면 종료일의 연도를 생략 ('25.08.10~09.06') */
export const formatPeriodShort = (
  from?: string | null,
  to?: string | null,
): string => {
  if (!from || !to) return formatDateShort(from) || formatDateShort(to);
  const sameYear = new Date(from).getFullYear() === new Date(to).getFullYear();
  const toShort = sameYear ? formatDateShort(to).slice(3) : formatDateShort(to);
  return `${formatDateShort(from)}~${toShort}`;
};
