'use client';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Box, ButtonBase, Collapse, Divider, Stack } from '@mui/material';
import { useState } from 'react';
import { BookCover } from '@/shared/components/book/BookCover';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { Book } from '@/shared/types/book';
import type { BookSpecOption } from '@/shared/types/order';
import { formatDate } from '@/shared/utils/date';

/** 백엔드 검증(@Min 1·@Max 100)과 동일한 범위 */
const MIN_COPIES = 1;
const MAX_COPIES = 100;

interface ConfirmStepProps {
  spec: BookSpecOption;
  pageCount: number;
  /** 수록 책 — 무엇이 실리는지 접어서 확인할 수 있게 */
  books: Book[];
  copies: string;
  onCopiesChange: (value: string) => void;
  memberCount: number;
  shippingFee: number;
  /** 예상 수령일 범위 — 제작 3~4영업일 + 배송 1~2일 */
  delivery: { earliest: string; latest: string };
  copiesError?: string;
}

const Row = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
  >
    <Typo
      token={strong ? 'text_sb_14' : 'text_r_14'}
      color={strong ? colorChips.grayScale[800] : colorChips.grayScale[600]}
    >
      {label}
    </Typo>
    <Typo
      token={strong ? 'text_sb_16' : 'text_r_14'}
      color={strong ? colorChips.grayScale[900] : colorChips.grayScale[800]}
    >
      {value}
    </Typo>
  </Stack>
);

/**
 * 4단계 — 부수와 최종 확인.
 *
 * 금액은 제작처 단가 공식(기본가 + 쪽수 증가분)을 그대로 따르고, 수령일은 제작·배송 SLA로
 * 환산해 보여준다. 결제는 만들지 않지만, 부수를 정하려면 얼마가 드는지·언제 받는지가 필요하다.
 */
export const ConfirmStep = ({
  spec,
  pageCount,
  books,
  copies,
  onCopiesChange,
  memberCount,
  shippingFee,
  delivery,
  copiesError,
}: ConfirmStepProps) => {
  const [booksOpen, setBooksOpen] = useState(false);

  return (
    <Stack>
      <Typo token="text_r_14" color={colorChips.grayScale[800]}>
        <b>{spec.name}</b> · {books.length}권 수록 · {pageCount}쪽으로 만들어요.
        몇 부가 필요한지 정해 주세요.
      </Typo>

      <VerticalGap size={8} />
      <ButtonBase
        onClick={() => setBooksOpen((prev) => !prev)}
        sx={{
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          gap: 0.25,
          alignSelf: 'flex-start',
        }}
      >
        <Typo token="text_m_12" color={colorChips.grayScale[600]}>
          수록 책 {books.length}권 보기
        </Typo>
        <ExpandMoreRoundedIcon
          sx={{
            fontSize: 16,
            color: colorChips.grayScale[500],
            transform: booksOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </ButtonBase>
      <Collapse in={booksOpen}>
        <VerticalGap size={8} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1,
            p: 1.5,
            borderRadius: 1.5,
            border: `1px solid ${colorChips.grayScale[200]}`,
            backgroundColor: colorChips.basic.white,
          }}
        >
          {books.map((book, index) => (
            <Stack
              key={book.publicId}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Typo
                token="text_sb_12"
                color={colorChips.grayScale[400]}
                sx={{ width: 14, flexShrink: 0, textAlign: 'center' }}
              >
                {index + 1}
              </Typo>
              <BookCover
                color={book.coverColor}
                emoji={book.coverEmoji}
                width={28}
                fontSize={13}
                // 표지가 작을수록 같은 라운드가 과하게 보인다
                borderRadius={0.75}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typo
                  token="text_r_14"
                  color={colorChips.grayScale[700]}
                  sx={lineClamp(1)}
                >
                  {book.title}
                </Typo>
                <Typo token="text_r_12" color={colorChips.grayScale[400]}>
                  코멘트 {book.commentCount}개
                </Typo>
              </Box>
            </Stack>
          ))}
        </Box>
      </Collapse>

      <VerticalGap size={24} />

      <CommonInput
        label="인쇄 부수 *"
        type="number"
        value={copies}
        onChange={(e) => onCopiesChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLElement).blur();
        }}
        onBlur={() => {
          // 직접 입력한 비정상 값은 유효 범위로 폴백
          const parsed = Number(copies);
          if (!copies || !Number.isInteger(parsed) || parsed < MIN_COPIES) {
            onCopiesChange(String(MIN_COPIES));
          } else if (parsed > MAX_COPIES) {
            onCopiesChange(String(MAX_COPIES));
          }
        }}
        errorMessage={copiesError}
        helperText={
          copiesError
            ? undefined
            : memberCount > 0
              ? `모임 멤버 수만큼 ${memberCount}부를 기본으로 담아뒀어요. 최대 ${MAX_COPIES}부까지 주문할 수 있어요.`
              : `필요한 부수를 입력해 주세요. 최대 ${MAX_COPIES}부까지 주문할 수 있어요.`
        }
        slotProps={{ htmlInput: { min: MIN_COPIES, max: MAX_COPIES } }}
        sx={{ maxWidth: 280 }}
      />

      <VerticalGap size={24} />
      <Stack
        spacing={1}
        sx={{
          p: 2,
          borderRadius: 1.5,
          border: `1px solid ${colorChips.grayScale[200]}`,
          backgroundColor: colorChips.basic.white,
        }}
      >
        <Row
          label={`${spec.name} ${pageCount}쪽 × ${spec.unitPrice.toLocaleString()}원`}
          value={`${spec.productAmount.toLocaleString()}원`}
        />
        <Row label="배송비" value={`${shippingFee.toLocaleString()}원`} />
        <Divider />
        <Row
          label="예상 제작비"
          value={`${spec.totalAmount.toLocaleString()}원`}
          strong
        />
      </Stack>

      <VerticalGap size={12} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <LocalShippingOutlinedIcon
          sx={{ fontSize: 18, color: colorChips.grayScale[500], mt: '2px' }}
        />
        <Stack spacing={0.25}>
          <Typo
            token="text_r_12"
            color={colorChips.grayScale[600]}
            sx={{ wordBreak: 'keep-all' }}
          >
            주문을 확인한 뒤 제작에 3~4 영업일, 배송에 1~2일이 걸려요.{' '}
            <b>
              {formatDate(delivery.earliest)}~{formatDate(delivery.latest)}
            </b>{' '}
            사이에 받아보실 수 있어요.
          </Typo>
          {/* 공휴일 단서는 별도 줄로 — 앞 문장과 섞이면 예상일이 잘 안 읽힌다 */}
          <Typo token="text_r_12" color={colorChips.grayScale[600]}>
            공휴일이 끼면 조금 늦어질 수 있어요.
          </Typo>
        </Stack>
      </Stack>
    </Stack>
  );
};
