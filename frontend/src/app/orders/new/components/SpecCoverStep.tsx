'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { colorChips } from '@/shared/styles/colors';
import type { BookSpecOption } from '@/shared/types/order';
import { AnthologyCover } from './AnthologyCover';
import { COVER_COLORS, COVER_EMOJIS, describeIneligible } from './orderSpec';

interface SpecCoverStepProps {
  specs: BookSpecOption[];
  pageCount: number;
  selectedSpecUid: string;
  onSelectSpec: (bookSpecUid: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  coverColor: string;
  onCoverColorChange: (value: string) => void;
  coverEmoji: string;
  onCoverEmojiChange: (value: string) => void;
  clubName: string;
  period?: string;
  titleError?: string;
}

/**
 * 3단계 — 판형과 표지.
 *
 * 판형 하나가 표지 유형·제본·페이지 규칙·가격을 함께 결정하므로 카드 하나로 고른다 (D-033).
 * 이 분량으로 만들 수 없는 판형은 **이유와 함께** 비활성으로 보여준다 — 무엇을 하면
 * 고를 수 있는지 알려주는 게 목적이라 숨기지 않는다 (D-035).
 */
export const SpecCoverStep = ({
  specs,
  pageCount,
  selectedSpecUid,
  onSelectSpec,
  title,
  onTitleChange,
  coverColor,
  onCoverColorChange,
  coverEmoji,
  onCoverEmojiChange,
  clubName,
  period,
  titleError,
}: SpecCoverStepProps) => {
  const selected = specs.find((spec) => spec.bookSpecUid === selectedSpecUid);

  return (
    <Stack>
      <Typo token="text_r_14" color={colorChips.grayScale[800]}>
        문집은 <b>{pageCount}쪽</b>으로 만들어져요. 판형을 고르면 표지 재질과
        제본 방식이 함께 정해져요.
      </Typo>
      <VerticalGap size={16} />

      <Stack spacing={1}>
        {specs.map((spec) => {
          const isSelected = spec.bookSpecUid === selectedSpecUid;
          const reason = describeIneligible(spec);
          return (
            <ButtonBase
              key={spec.bookSpecUid}
              disabled={!spec.eligible}
              onClick={() => onSelectSpec(spec.bookSpecUid)}
              sx={{
                display: 'block',
                textAlign: 'left',
                p: 1.75,
                borderRadius: 1.5,
                // 못 고르는 카드도 '옵션이 있다'는 건 보여야 한다 — 흐리게 하는 대신
                // 파선 테두리와 회색 배경으로 성격을 구분한다
                border: spec.eligible
                  ? `1px solid ${
                      isSelected
                        ? colorChips.primary[500]
                        : colorChips.grayScale[300]
                    }`
                  : `1px dashed ${colorChips.grayScale[400]}`,
                backgroundColor: spec.eligible
                  ? isSelected
                    ? colorChips.primary[100]
                    : colorChips.basic.white
                  : colorChips.grayScale[200],
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={0.75} sx={{ minWidth: 0 }}>
                  <Typo
                    token="text_sb_14"
                    color={
                      spec.eligible
                        ? colorChips.grayScale[800]
                        : colorChips.grayScale[600]
                    }
                  >
                    {spec.name}
                  </Typo>
                  {isSelected && (
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 18, color: colorChips.primary[500] }}
                    />
                  )}
                </Stack>
                {spec.eligible && (
                  <Typo
                    token="text_sb_14"
                    color={colorChips.grayScale[800]}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {spec.unitPrice.toLocaleString()}원
                    <Typo
                      component="span"
                      token="text_r_12"
                      color={colorChips.grayScale[500]}
                    >
                      {' '}
                      / 1부
                    </Typo>
                  </Typo>
                )}
              </Stack>
              <VerticalGap size={4} />
              <Typo
                token="text_r_12"
                color={
                  spec.eligible
                    ? colorChips.grayScale[600]
                    : colorChips.grayScale[500]
                }
              >
                {spec.innerTrimWidthMm}×{spec.innerTrimHeightMm}mm ·{' '}
                {spec.coverType === 'HARDCOVER' ? '하드커버' : '소프트커버'} ·{' '}
                {spec.bindingType} 제본 · {spec.pageMin}~{spec.pageMax}쪽
              </Typo>
              <VerticalGap size={4} />
              <Typo
                token="text_r_12"
                color={
                  spec.eligible
                    ? colorChips.grayScale[600]
                    : colorChips.system.warning
                }
                sx={{ wordBreak: 'keep-all' }}
              >
                {reason ?? spec.description}
              </Typo>
            </ButtonBase>
          );
        })}
      </Stack>

      <VerticalGap size={32} />
      <Typo token="text_sb_16" color={colorChips.grayScale[800]}>
        표지 만들기
      </Typo>
      <VerticalGap size={12} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
      >
        {selected && (
          <AnthologyCover
            color={coverColor}
            emoji={coverEmoji}
            title={title}
            clubName={clubName}
            period={period}
            widthMm={selected.innerTrimWidthMm}
            heightMm={selected.innerTrimHeightMm}
          />
        )}

        <Stack sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <CommonInput
            label="문집 제목 *"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            errorMessage={titleError}
            maxLength={100}
          />
          <VerticalGap size={20} />

          <Typo token="text_m_12" color={colorChips.grayScale[600]}>
            표지 색
          </Typo>
          <VerticalGap size={6} />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {COVER_COLORS.map((color) => (
              <ButtonBase
                key={color}
                onClick={() => onCoverColorChange(color)}
                aria-label={`표지 색 ${color}`}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: color,
                  border:
                    color === coverColor
                      ? `3px solid ${colorChips.grayScale[800]}`
                      : '3px solid transparent',
                }}
              />
            ))}
          </Stack>
          <VerticalGap size={16} />

          <Typo token="text_m_12" color={colorChips.grayScale[600]}>
            표지 이모지
          </Typo>
          <VerticalGap size={6} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 0.5,
            }}
          >
            {COVER_EMOJIS.map((emoji) => (
              <ButtonBase
                key={emoji}
                onClick={() => onCoverEmojiChange(emoji)}
                sx={{
                  height: 32,
                  borderRadius: 1.5,
                  fontSize: 18,
                  backgroundColor:
                    emoji === coverEmoji
                      ? colorChips.primary[100]
                      : 'transparent',
                }}
              >
                {emoji}
              </ButtonBase>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};
