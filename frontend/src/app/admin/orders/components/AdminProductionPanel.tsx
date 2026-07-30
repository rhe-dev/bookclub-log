'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Box, Skeleton, Stack } from '@mui/material';
import {
  useAdminProductionQuery,
  useAdminVendorEventMutation,
} from '@/shared/api/adminApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CopyableId } from '@/shared/components/ui/CopyableId';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type {
  AdminOrder,
  OrderStatus,
  VendorEvent,
} from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';

/**
 * 제작처가 다음에 보낼 이벤트 — 벤더 상태에 따라 하나씩 순서대로 온다.
 * 실제로는 웹훅으로 들어오지만, 외부 의존 없이 도는 데모라 운영자가 대신 흘려보낸다 (D-034).
 */
const NEXT_EVENT: Record<string, { event: VendorEvent; label: string }> = {
  PDF_READY: { event: 'production.confirmed', label: '제작 확정' },
  CONFIRMED: { event: 'production.started', label: '제작 시작' },
  IN_PRODUCTION: { event: 'production.completed', label: '제작 완료' },
  PRODUCTION_COMPLETE: { event: 'shipping.departed', label: '발송' },
  SHIPPED: { event: 'shipping.delivered', label: '배송 완료' },
};

/** 더 진행하지 않는 주문 — 발주 안내가 의미 없는 상태 */
const CLOSED_STATUSES: OrderStatus[] = [
  'CANCELED',
  'REFUNDED',
  'PURCHASE_CONFIRMED',
];

const Row = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
    <Typo
      token="text_r_12"
      color={colorChips.grayScale[500]}
      sx={{ width: 88, flexShrink: 0 }}
    >
      {label}
    </Typo>
    <Typo token="text_r_12" color={colorChips.grayScale[700]}>
      {value}
    </Typo>
  </Stack>
);

/**
 * 북프린트 연동 패널 — 사양 재확인 → 발주 → 제작처 이벤트 수신 (PLAN §5-1).
 *
 * 제작·배송 단계를 운영자가 임의로 누르지 않는 것이 이 화면의 핵심이다.
 * 파트너가 직접 하는 일은 **발주까지**이고, 그 뒤는 제작처가 알려준다.
 */
export const AdminProductionPanel = ({
  order,
  onOpenDispatch,
}: {
  order: AdminOrder;
  /** 발주 모달 열기 — 확인과 메모 입력을 모달에서 받는다 */
  onOpenDispatch: () => void;
}) => {
  const { data, isLoading } = useAdminProductionQuery(order.publicId);
  const eventMutation = useAdminVendorEventMutation(order.publicId);

  if (isLoading || !data)
    return <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2 }} />;

  const pageChanged = data.currentPageCount !== data.orderedPageCount;
  const nextEvent = data.vendorStatus ? NEXT_EVENT[data.vendorStatus] : null;
  // 발주 없이 끝난 주문 — 사양 검증 결과나 '발주할 수 있어요'는 지난 이야기다
  const closedWithoutDispatch =
    !data.vendorOrderUid && CLOSED_STATUSES.includes(order.status);

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 1.5,
        // 발주 전(주문 확인 단계)에는 항상 강조 — 운영자가 지금 할 일이 여기 있다
        border: `1px solid ${
          data.canDispatch ? colorChips.primary[300] : colorChips.grayScale[200]
        }`,
        backgroundColor: data.canDispatch
          ? colorChips.primary[100]
          : colorChips.grayScale[100],
      }}
    >
      <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
        북프린트 연동
      </Typo>
      <VerticalGap size={8} />

      <Stack spacing={0.25}>
        <Row label="판형" value={data.specName} />
        <Row
          label="쪽수"
          value={
            pageChanged
              ? `${data.orderedPageCount}쪽 → ${data.currentPageCount}쪽 (주문 후 변경됨)`
              : `${data.currentPageCount}쪽`
          }
        />
        {data.pageMin !== null && data.pageMax !== null && (
          <Row
            label="판형 규칙"
            value={`${data.pageMin}~${data.pageMax}쪽 · 2쪽 단위`}
          />
        )}
      </Stack>

      {!closedWithoutDispatch && (
        <>
          <VerticalGap size={8} />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {data.eligible ? (
              <CheckCircleRoundedIcon
                sx={{ fontSize: 16, color: colorChips.system.success }}
              />
            ) : (
              <ErrorOutlineRoundedIcon
                sx={{ fontSize: 16, color: colorChips.system.warning }}
              />
            )}
            <Typo
              token="text_m_12"
              color={
                data.eligible
                  ? colorChips.system.success
                  : colorChips.system.warning
              }
              sx={{ wordBreak: 'keep-all' }}
            >
              {data.eligible
                ? // 발주 뒤에는 '할 수 있어요'가 지난 안내라 결과만 남긴다
                  data.vendorOrderUid
                  ? '사양 검증 통과'
                  : '사양 검증 통과 — 발주할 수 있어요'
                : `사양 미충족 (${data.ineligibleReason} / 기준 ${data.requiredValue}) — 발주 시 제작처가 거부해요`}
            </Typo>
          </Stack>
        </>
      )}

      {data.vendorOrderUid ? (
        <>
          <VerticalGap size={12} />
          <Stack spacing={0.25}>
            <CopyableId
              label="제작처 주문번호"
              value={data.vendorOrderUid}
              labelWidth={88}
            />
            <Row
              label="제작처 상태"
              value={`${data.vendorStatusDisplay ?? '-'} · ${formatDateTime(data.vendorStatusAt)}`}
            />
            {data.trackingNumber && (
              <Row
                label="송장"
                value={`${data.trackingCarrier} ${data.trackingNumber}`}
              />
            )}
          </Stack>

          <VerticalGap size={12} />
          <Typo token="text_m_12" color={colorChips.grayScale[600]}>
            제작처 이벤트 {data.events.length}
          </Typo>
          <VerticalGap size={4} />
          {/* 우리 상태가 바뀌지 않는 이벤트도 남는다 — 없으면 진행이 멈춘 것처럼 보인다 */}
          <Stack
            spacing={0.25}
            sx={{
              borderLeft: `2px solid ${colorChips.grayScale[200]}`,
              pl: 1.25,
              ml: 0.25,
            }}
          >
            {data.events.map((entry, index) => (
              <Stack
                key={`${entry.event}-${index}`}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
              >
                <Typo
                  token="text_m_12"
                  color={colorChips.grayScale[700]}
                  sx={{ width: 96, flexShrink: 0 }}
                >
                  {entry.vendorStatusDisplay}
                </Typo>
                <Typo token="text_r_12" color={colorChips.grayScale[500]}>
                  {formatDateTime(entry.receivedAt)} · {entry.event}
                  {entry.detail ? ` · ${entry.detail}` : ''}
                </Typo>
              </Stack>
            ))}
          </Stack>

          <VerticalGap size={12} />
          {nextEvent ? (
            <Stack spacing={0.75}>
              <Typo
                token="text_r_12"
                color={colorChips.grayScale[500]}
                sx={{ wordBreak: 'keep-all' }}
              >
                이후 단계는 제작처가 웹훅으로 알려줘요. 데모에서는 아래 버튼으로
                이벤트를 대신 흘려보냅니다.
              </Typo>
              <CommonButton
                label={`제작처 이벤트 수신 — ${nextEvent.label}`}
                size="small"
                buttonColor="tertiary"
                isLoading={eventMutation.isPending}
                onClick={() =>
                  eventMutation.mutate(nextEvent.event, {
                    onSuccess: () =>
                      toast.success(
                        `제작처 이벤트를 받았어요 — ${nextEvent.label}`,
                      ),
                  })
                }
                sx={{ alignSelf: 'flex-start' }}
              />
            </Stack>
          ) : (
            <Typo token="text_r_12" color={colorChips.grayScale[500]}>
              제작처에서 더 올 이벤트가 없어요.
            </Typo>
          )}
        </>
      ) : data.canDispatch ? (
        <>
          <VerticalGap size={12} />
          <CommonButton
            label="북프린트 발주"
            size="small"
            onClick={onOpenDispatch}
            sx={{ alignSelf: 'flex-start' }}
          />
        </>
      ) : (
        <>
          <VerticalGap size={8} />
          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            {closedWithoutDispatch
              ? '발주하지 않고 종결된 주문이에요.'
              : '주문 확인 단계에서 발주할 수 있어요.'}
          </Typo>
        </>
      )}
    </Box>
  );
};
