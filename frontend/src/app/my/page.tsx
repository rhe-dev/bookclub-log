'use client';

// 마이페이지 — 내 프로필(클럽별 역할)·로그아웃 + 내 주문·내 코멘트 (클럽 무관 전체) (PLAN 화면 5, D-024)
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import { useMyCommentsInfiniteQuery } from '@/shared/api/commentApi';
import { useMyOrdersInfiniteQuery } from '@/shared/api/orderApi';
import { ClubRoleTag } from '@/shared/components/club/ClubRoleTag';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonListRow } from '@/shared/components/ui/CommonListRow';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { MemberAvatar } from '@/shared/components/ui/MemberAvatar';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { useSessionActions } from '@/shared/hooks/useSessionActions';
import { colorChips } from '@/shared/styles/colors';
import { MyCommentCard } from './components/MyCommentCard';
import { MyPageSkeleton } from './components/MyPageSkeleton';
import { OrderCard } from './components/OrderCard';

export default function MyPage() {
  const router = useRouter();
  const session = useRequireMember();
  const { goClub, logout } = useSessionActions();
  const myClubsQuery = useMyClubsQuery(session?.member.publicId);
  const ordersQuery = useMyOrdersInfiniteQuery(session?.member.publicId);
  const commentsQuery = useMyCommentsInfiniteQuery(session?.member.publicId);

  if (!session) return null;
  const { member } = session;

  const orders = ordersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const orderCount = ordersQuery.data?.pages[0]?.meta.totalCount ?? 0;
  const comments =
    commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const commentCount = commentsQuery.data?.pages[0]?.meta.totalCount ?? 0;
  const isLoading =
    myClubsQuery.isLoading || ordersQuery.isLoading || commentsQuery.isLoading;
  const isError =
    myClubsQuery.isError || ordersQuery.isError || commentsQuery.isError;

  return (
    <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 } }}>
      {isError ? (
        <ErrorView
          message="마이페이지를 불러오지 못했어요."
          onRetry={() => {
            void myClubsQuery.refetch();
            void ordersQuery.refetch();
            void commentsQuery.refetch();
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
                onClick={logout}
              />
            </Stack>

            <VerticalGap size={16} />
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              가입한 클럽
            </Typo>
            <VerticalGap size={8} />
            <Stack spacing={1}>
              {myClubsQuery.data?.map((club) => (
                <CommonListRow
                  key={club.publicId}
                  onClick={() => goClub(club)}
                  ariaLabel={`${club.name} 책방으로 이동`}
                >
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                  >
                    <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
                      {club.name}
                    </Typo>
                    <ClubRoleTag role={club.myRole} />
                  </Stack>
                  <ChevronRightRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: colorChips.grayScale[400],
                      flexShrink: 0,
                    }}
                  />
                </CommonListRow>
              ))}
            </Stack>
          </Box>

          <VerticalGap size={24} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typo token="text_sb_18">내 코멘트</Typo>
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              {commentCount}
            </Typo>
          </Stack>
          <VerticalGap size={12} />

          {comments.length === 0 ? (
            <Typo
              token="text_r_14"
              color={colorChips.grayScale[500]}
              align="center"
              sx={{ py: 4, wordBreak: 'keep-all' }}
            >
              아직 남긴 코멘트가 없어요. 책방에서 읽고 있는 책에 첫 밑줄을 남겨
              보세요.
            </Typo>
          ) : (
            <Stack spacing={1.5}>
              {comments.map((comment) => (
                <MyCommentCard key={comment.publicId} comment={comment} />
              ))}
              {commentsQuery.hasNextPage && (
                <CommonButton
                  label="코멘트 더 보기"
                  buttonColor="tertiary"
                  isLoading={commentsQuery.isFetchingNextPage}
                  onClick={() => void commentsQuery.fetchNextPage()}
                />
              )}
            </Stack>
          )}
          <VerticalGap size={32} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typo token="text_sb_18">내 문집 주문</Typo>
            <Typo token="text_m_12" color={colorChips.grayScale[500]}>
              {orderCount}
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
              {ordersQuery.hasNextPage && (
                <CommonButton
                  label="주문 더 보기"
                  buttonColor="tertiary"
                  isLoading={ordersQuery.isFetchingNextPage}
                  onClick={() => void ordersQuery.fetchNextPage()}
                />
              )}
            </Stack>
          )}
        </>
      )}
    </CommonContainer>
  );
}
