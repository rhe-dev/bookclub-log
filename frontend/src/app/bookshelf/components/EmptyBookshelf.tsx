import { Stack } from '@mui/material';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

interface EmptyBookshelfProps {
  isLeader: boolean;
  onAddBook: () => void;
}

/** 빈 책방 온보딩 — 다음 행동(책 추가)을 안내 (QA 루브릭 ①③) */
export const EmptyBookshelf = ({
  isLeader,
  onAddBook,
}: EmptyBookshelfProps) => {
  return (
    <Stack
      spacing={2}
      sx={{
        alignItems: 'center',
        py: 8,
        borderRadius: 3,
        backgroundColor: colorChips.basic.white,
        border: `1px dashed ${colorChips.grayScale[300]}`,
      }}
    >
      <Typo token="text_b_24">📚</Typo>
      <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
        <Typo token="text_sb_18">아직 책방이 비어 있어요</Typo>
        <Typo
          token="text_r_14"
          color={colorChips.grayScale[600]}
          align="center"
        >
          {isLeader
            ? '함께 읽을 첫 책을 추가하면 여기에 우리 모임의 기록이 쌓입니다.'
            : '모임장이 첫 책을 등록하면 여기에 우리 모임의 기록이 쌓입니다.'}
        </Typo>
      </Stack>
      {isLeader && <CommonButton label="첫 책 추가하기" onClick={onAddBook} />}
    </Stack>
  );
};
