'use client';

// 마이페이지 — 내 프로필(클럽별 역할)·로그아웃 + 내 주문 목록(클럽 무관, 내가 주문자인 건 전체) (PLAN 화면 5, D-024)
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import { useMyOrdersQuery } from '@/shared/api/orderApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { MyClub } from '@/shared/types/club';
import { MyPageSkeleton } from './components/MyPageSkeleton';
import { OrderCard } from './components/OrderCard';

export default function MyPage() {
  const router = useRouter();
  const session = useRequireMember();
  const switchClub = useMemberStore((s) => s.switchClub);
  const logout = useMemberStore((s) => s.logout);
  const myClubsQuery = useMyClubsQuery(session?.member.publicId);
  const ordersQuery = useMyOrdersQuery(session?.member.publicId);

  if (!session) return null;
  const { member } = session;

  const orders = ordersQuery.data?.items ?? [];
  const isLoading = myClubsQuery.isLoading || ordersQuery.isLoading;
  const isError = myClubsQuery.isError || ordersQuery.isError;

  const handleLogout = () => {
    logout();
    toast.info('로그아웃했어요. 다음에 또 만나요!');
    router.replace(ROUTES.home);
  };

  // 클럽 선택 — 다른 클럽이면 컨텍스트 전환 후 그 클럽 책방으로 (GNB와 동일 동작)
  const handleGoClub = (target: MyClub) => {
    if (target.publicId !== session?.club.publicId) {
      switchClub({
        publicId: target.publicId,
        name: target.name,
        role: target.myRole,
      });
      toast.success(`'${target.name}' 책방으로 이동했어요.`);
    }
    router.push(ROUTES.bookshelf);
  };

  return (
    <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 } }}>
      {isError ? (
        <ErrorView
          message="마이페이지를 불러오지 못했어요."
          onRetry={() => {
            void myClubsQuery.refetch();
            void ordersQuery.refetch();
          }}
        />
      ) : isLoading ? (
        <MyPageSkeleton />
      ) : (
        <>
          <Box
            sx={{
              borderRadius: 2,
              border: `1px solid ${colorChips.grayScale[200]}`,
              backgroundColor: colorChips.basic.white,
              p: { xs: 2, md: 2.5 },
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <MemberAvatar
                  color={member.color}
                  emoji={member.avatarEmoji}
                  size={48}
                />
                <Typo token="text_b_18" color={colorChips.grayScale[800]}>
                  {member.name}
                </Typo>
              </Stack>
              <CommonButton
                label="로그아웃"
                size="small"
                buttonColor="tertiary"
                buttonVariant="outlined"
                onClick={handleLogout}
              />
            </Stack>

            <VerticalGap size={16} />
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              가입한 클럽
            </Typo>
            <VerticalGap size={8} />
            <Stack spacing={1}>
              {myClubsQuery.data?.map((club) => (
                <ButtonBase
                  key={club.publicId}
                  onClick={() => handleGoClub(club)}
                  aria-label={`${club.name} 책방으로 이동`}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    textAlign: 'left',
                    border: `1px solid ${colorChips.grayScale[200]}`,
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.25,
                    '&:hover': {
                      borderColor: colorChips.primary[300],
                      backgroundColor: colorChips.grayScale[50],
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                      {club.name}
                    </Typo>
                    <Box
                      sx={{
                        px: 0.6,
                        py: 0.2,
                        borderRadius: 999,
                        backgroundColor:
                          club.myRole === 'LEADER'
                            ? colorChips.secondary[100]
                            : colorChips.grayScale[100],
                      }}
                    >
                      <Typo
                        token="text_sb_10"
                        color={
                          club.myRole === 'LEADER'
                            ? colorChips.secondary[700]
                            : colorChips.grayScale[600]
                        }
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {club.myRole === 'LEADER' ? '모임장' : '멤버'}
                      </Typo>
                    </Box>
                  </Stack>
                  <ChevronRightRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: colorChips.grayScale[400],
                      flexShrink: 0,
                    }}
                  />
                </ButtonBase>
              ))}
            </Stack>
          </Box>

          <VerticalGap size={24} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typo token="text_sb_18">내 문집 주문</Typo>
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              {ordersQuery.data?.meta.totalCount ?? 0}
            </Typo>
          </Stack>
          <VerticalGap size={12} />

          {orders.length === 0 ? (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
              <Typo
                token="text_r_14"
                color={colorChips.grayScale[500]}
                align="center"
                sx={{ wordBreak: 'keep-all' }}
              >
                아직 주문한 문집이 없어요. 완독한 책들로 우리 모임의 첫 문집을
                만들어 보세요.
              </Typo>
              <CommonButton
                label="문집 만들기"
                buttonColor="secondary"
                onClick={() => router.push(ROUTES.orderNew)}
              />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {orders.map((order) => (
                <OrderCard key={order.publicId} order={order} />
              ))}
            </Stack>
          )}
        </>
      )}
    </CommonContainer>
  );
}
