'use client';

// 입장 화면 — 프로필 선택으로 현재 멤버를 정하고 책방에 들어간다 (PLAN F0, D-003)
import { Box, ButtonBase, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useClubMembersQuery, useClubsQuery } from '@/shared/api/clubApi';
import { EntrySkeleton } from './components/EntrySkeleton';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { useMemberStore } from '@/shared/stores/memberStore';
import { colorChips } from '@/shared/styles/colors';
import type { ClubMember } from '@/shared/types/club';

export default function EntryPage() {
  const router = useRouter();
  const member = useMemberStore((s) => s.member);
  const setMember = useMemberStore((s) => s.setMember);

  const clubsQuery = useClubsQuery();
  const club = clubsQuery.data?.[0];
  const membersQuery = useClubMembersQuery(club?.publicId);

  // 이미 입장한 멤버는 바로 책방으로
  useEffect(() => {
    if (member) router.replace(ROUTES.bookshelf);
  }, [member, router]);

  const handleSelect = (selected: ClubMember) => {
    setMember(selected);
    router.push(ROUTES.bookshelf);
  };

  const isLoading = clubsQuery.isLoading || membersQuery.isLoading;
  const isError = clubsQuery.isError || membersQuery.isError;

  if (member) return null;

  return (
    <>
      <CommonContainer maxWidth={600} sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
          <Typo
            token="text_b_24"
            align="center"
            sx={{ fontSize: { xs: 20, md: 24 } }}
          >
            모임이 함께 읽은 책과 토론이 쌓이는
            <br />
            우리 모임 책방
          </Typo>

          {isError ? (
            <ErrorView
              message="모임 정보를 불러오지 못했어요."
              onRetry={() => {
                void clubsQuery.refetch();
                void membersQuery.refetch();
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                backgroundColor: colorChips.basic.white,
                border: `1px solid ${colorChips.grayScale[200]}`,
                borderRadius: 3,
                px: { xs: 3, md: 4 },
                py: { xs: 4, md: 5 },
              }}
            >
              {isLoading || !club ? (
                <EntrySkeleton />
              ) : (
                <Stack spacing={3.5} sx={{ alignItems: 'center' }}>
                  <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <Typo token="text_b_20">{club.name}</Typo>
                    <Typo
                      token="text_r_14"
                      color={colorChips.grayScale[600]}
                      align="center"
                    >
                      {club.description}
                    </Typo>
                    <Typo token="text_m_12" color={colorChips.grayScale[500]}>
                      멤버 {club.memberCount}명
                    </Typo>
                  </Stack>

                  <Typo token="text_sb_16">누구로 입장할까요?</Typo>

                  <Box
                    sx={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(3, 1fr)',
                        sm: 'repeat(3, 1fr)',
                      },
                      gap: { xs: 2, md: 2.5 },
                    }}
                  >
                    {membersQuery.data?.map((m) => (
                      <ButtonBase
                        key={m.publicId}
                        onClick={() => handleSelect(m)}
                        aria-label={`${m.name}(으)로 입장`}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          py: 1.5,
                          borderRadius: 2.5,
                          '&:hover': {
                            backgroundColor: colorChips.grayScale[100],
                          },
                        }}
                      >
                        <MemberAvatar
                          color={m.color}
                          emoji={m.avatarEmoji}
                          size={{ xs: 56, md: 64 }}
                        />
                        <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
                          <Typo
                            token="text_sb_14"
                            color={colorChips.grayScale[800]}
                          >
                            {m.name}
                          </Typo>
                          {m.role === 'LEADER' && (
                            <Typo
                              token="text_m_12"
                              color={colorChips.secondary[500]}
                            >
                              모임장
                            </Typo>
                          )}
                        </Stack>
                      </ButtonBase>
                    ))}
                  </Box>
                </Stack>
              )}
            </Box>
          )}

          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            프로필을 선택하면 우리 모임 책방으로 들어갑니다
          </Typo>
        </Stack>
      </CommonContainer>
    </>
  );
}
