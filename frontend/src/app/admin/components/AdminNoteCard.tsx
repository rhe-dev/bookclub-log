'use client';

import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useAdminNoteMutation } from '@/shared/api/adminApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';

interface AdminNoteCardProps {
  target: 'member' | 'club';
  publicId: string;
  note: string | null;
}

/**
 * 운영자 메모 — 회원·클럽 상세가 공유한다 (D-030 개정).
 *
 * 회원·클럽은 조회 대상이라 운영자가 바꿀 수 있는 건 이 메모뿐이다.
 * 응대 이력을 남겨 두면 다음 사람이 같은 문의를 처음부터 다시 파악하지 않아도 된다.
 */
export const AdminNoteCard = ({
  target,
  publicId,
  note,
}: AdminNoteCardProps) => {
  const [value, setValue] = useState(note ?? '');
  const mutation = useAdminNoteMutation(target, publicId);

  // 다른 대상으로 이동했을 때 이전 메모가 남지 않게 — 렌더 중 상태 조정
  const [lastId, setLastId] = useState(publicId);
  if (publicId !== lastId) {
    setLastId(publicId);
    setValue(note ?? '');
  }

  const dirty = value.trim() !== (note ?? '');

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${colorChips.grayScale[200]}`,
        backgroundColor: colorChips.grayScale[100],
      }}
    >
      <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
        운영자 메모
      </Typo>
      <VerticalGap size={4} />
      <Typo token="text_r_12" color={colorChips.grayScale[500]}>
        응대 내용·특이사항을 남겨 두면 다음 담당자가 이어받을 수 있어요.
      </Typo>
      <VerticalGap size={12} />
      <CommonInput
        label="메모"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        multiline
        minRows={3}
        maxLength={1000}
        placeholder="예: 7/31 재제작 문의 — 인쇄 겹침 확인 후 재발주 안내"
      />
      <VerticalGap size={12} />
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
        {dirty && (
          <CommonButton
            label="되돌리기"
            size="small"
            buttonColor="tertiary"
            buttonVariant="outlined"
            onClick={() => setValue(note ?? '')}
          />
        )}
        <CommonButton
          label="메모 저장"
          size="small"
          disabled={!dirty}
          isLoading={mutation.isPending}
          onClick={() =>
            mutation.mutate(value, {
              onSuccess: () => toast.success('메모를 저장했어요.'),
            })
          }
        />
      </Stack>
    </Box>
  );
};
