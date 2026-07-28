'use client';

import { Box, ButtonBase, Skeleton, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMembersQuery } from '@/shared/api/memberApi';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useLoginModalStore } from '@/shared/stores/loginModalStore';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { MemberAccount } from '@/shared/types/member';

/**
 * 로그인 모달 — 회원 계정을 고르면 그대로 로그인 처리 (인증 없는 데모, D-017·D-024).
 * 로그인하면 첫 번째 가입 클럽의 책방으로 이동한다.
 */
export const LoginModal = () => {
  const router = useRouter();
  const isOpen = useLoginModalStore((s) => s.isOpen);
  const close = useLoginModalStore((s) => s.close);
  const login = useMemberStore((s) => s.login);
  const membersQuery = useMembersQuery(isOpen);

  const handleSelect = (account: MemberAccount) => {
    const firstClub = account.clubs[0];
    if (!firstClub) {
      toast.error('가입한 클럽이 없는 계정이에요.');
      return;
    }
    login(
      {
        publicId: account.publicId,
        name: account.name,
        avatarEmoji: account.avatarEmoji,
        color: account.color,
      },
      {
        publicId: firstClub.publicId,
        name: firstClub.name,
        role: firstClub.role,
      },
    );
    close();
    toast.success(`${account.name}님, 어서 오세요!`);
    router.push(ROUTES.bookshelf);
  };

  return (
    <CommonModal open={isOpen} onClose={close} title="로그인" maxWidth="xs">
      <Typo
        token="text_r_12"
        color={colorChips.grayScale[500]}
        sx={{ wordBreak: 'keep-all' }}
      >
        데모 서비스라 비밀번호 없이 계정 선택만으로 로그인돼요.
      </Typo>
      <VerticalGap size={12} />
      {/* 계정 리스트 영역 — 로딩 중에도 최소 높이를 유지해 모달이 갑자기 커지지 않게 */}
      <Box sx={{ minHeight: 320 }}>
        {membersQuery.isError ? (
          <ErrorView
            message="계정 목록을 불러오지 못했어요."
            onRetry={() => void membersQuery.refetch()}
          />
        ) : membersQuery.isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={1}>
            {membersQuery.data?.map((account) => (
              <ButtonBase
                key={account.publicId}
                onClick={() => handleSelect(account)}
                aria-label={`${account.name}(으)로 로그인`}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  textAlign: 'left',
                  border: `1px solid ${colorChips.grayScale[200]}`,
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  '&:hover': {
                    borderColor: colorChips.primary[300],
                    backgroundColor: colorChips.grayScale[50],
                  },
                }}
              >
                <MemberAvatar
                  color={account.color}
                  emoji={account.avatarEmoji}
                  size={36}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                    {account.name}
                  </Typo>
                  <Typo token="text_r_12" color={colorChips.grayScale[500]}>
                    {account.clubs
                      .map(
                        (club) =>
                          `${club.name}${club.role === 'LEADER' ? '(모임장)' : ''}`,
                      )
                      .join(' · ')}
                  </Typo>
                </Box>
              </ButtonBase>
            ))}
          </Stack>
        )}
      </Box>
    </CommonModal>
  );
};
