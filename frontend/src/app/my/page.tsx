'use client';

// 마이페이지 — 프로필(클럽별 역할)·로그아웃 + 내 코멘트/내 문집 주문 탭 (PLAN 화면 5, D-024)
import { Box, Stack } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useMyClubsQuery } from '@/shared/api/clubApi';
import {
  MY_COMMENTS_PAGE_SIZE,
  useMyCommentsQuery,
} from '@/shared/api/commentApi';
import { MY_ORDERS_PAGE_SIZE, useMyOrdersQuery } from '@/shared/api/orderApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonEmptyState } from '@/shared/components/ui/CommonEmptyState';
import { CommonPagination } from '@/shared/components/ui/CommonPagination';
import { CommonTab } from '@/shared/components/ui/CommonTab';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireMember } from '@/shared/hooks/useRequireMember';
import { useSessionActions } from '@/shared/hooks/useSessionActions';
import { MyCommentCard } from './components/MyCommentCard';
import { MyPageSkeleton } from './components/MyPageSkeleton';
import { MyProfileCard } from './components/MyProfileCard';
import { OrderCard } from './components/OrderCard';

// useSearchParams는 Suspense 경계가 필요 — 페이지는 래퍼만 두고 본문은 아래 컴포넌트
export default function MyPage() {
  return (
    <Suspense fallback={null}>
      <MyPageContent />
    </Suspense>
  );
}

type MyTab = 'comments' | 'orders';

/** 목록이 줄어 현재 페이지가 사라지면 마지막 페이지로 되돌린다 (빈 화면 갇힘 방지) */
const clampPage = (
  count: number,
  size: number,
  page: number,
  setPage: (next: number) => void,
) => {
  const lastPage = Math.max(1, Math.ceil(count / size));
  if (page > lastPage) setPage(lastPage);
};

function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 활동(코멘트·주문)은 탭으로 구분 — 탭 상태는 URL(?tab=)로 유지해 새로고침에도 같은 탭
  const tab: MyTab =
    searchParams.get('tab') === 'orders' ? 'orders' : 'comments';
  const session = useRequireMember();
  const { goClub, logout } = useSessionActions();
  const [commentsPage, setCommentsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const myClubsQuery = useMyClubsQuery(session?.member.publicId);
  const ordersQuery = useMyOrdersQuery(session?.member.publicId, ordersPage);
  const commentsQuery = useMyCommentsQuery(
    session?.member.publicId,
    commentsPage,
  );

  const orderCount = ordersQuery.data?.meta.totalCount ?? 0;
  const commentCount = commentsQuery.data?.meta.totalCount ?? 0;
  clampPage(commentCount, MY_COMMENTS_PAGE_SIZE, commentsPage, setCommentsPage);
  clampPage(orderCount, MY_ORDERS_PAGE_SIZE, ordersPage, setOrdersPage);

  if (!session) return null;
  const { member } = session;

  const orders = ordersQuery.data?.items ?? [];
  const comments = commentsQuery.data?.items ?? [];
  // 최초 로딩만 전체 스켈레톤 — 페이지 전환은 목록을 흐리게 해서 표시
  const isFirstLoading =
    myClubsQuery.isLoading || ordersQuery.isLoading || commentsQuery.isLoading;
  const fetchingSx = (isFetching: boolean) => ({
    transition: 'opacity 0.15s',
    opacity: isFetching ? 0.5 : 1,
  });

  return (
    <CommonContainer maxWidth={760} sx={{ py: { xs: 2.5, md: 4 } }}>
      {isFirstLoading ? (
        <MyPageSkeleton />
      ) : (
        <>
          <MyProfileCard
            member={member}
            clubs={myClubsQuery.data}
            isError={myClubsQuery.isError}
            onRetry={() => void myClubsQuery.refetch()}
            onSelectClub={goClub}
            onLogout={logout}
          />

          <VerticalGap size={16} />

          <CommonTab
            currentVal={tab}
            tabs={[
              { value: 'comments', label: `내 코멘트 ${commentCount}` },
              { value: 'orders', label: `내 문집 주문 ${orderCount}` },
            ]}
            handleChange={(next) =>
              router.replace(`${ROUTES.myPage}?tab=${next}`, { scroll: false })
            }
          />
          <VerticalGap size={16} />

          {/* 탭 콘텐츠는 각자 실패·로딩을 처리 — 한 목록이 실패해도 프로필·다른 탭은 살아 있다 */}
          {tab === 'comments' &&
            (commentsQuery.isError ? (
              <ErrorView
                message="내 코멘트를 불러오지 못했어요."
                onRetry={() => void commentsQuery.refetch()}
              />
            ) : (
              <Box sx={fetchingSx(commentsQuery.isFetching)}>
                {comments.length === 0 ? (
                  <CommonEmptyState
                    message="아직 남긴 코멘트가 없어요. 책방에서 읽고 있는 책에 첫 밑줄을 남겨 보세요."
                    action={
                      <CommonButton
                        label="책방으로"
                        buttonColor="tertiary"
                        onClick={() => router.push(ROUTES.bookshelf)}
                      />
                    }
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {comments.map((comment) => (
                      <MyCommentCard key={comment.publicId} comment={comment} />
                    ))}
                  </Stack>
                )}
                <CommonPagination
                  page={commentsPage}
                  totalCount={commentCount}
                  pageSize={MY_COMMENTS_PAGE_SIZE}
                  onChange={setCommentsPage}
                />
              </Box>
            ))}

          {tab === 'orders' &&
            (ordersQuery.isError ? (
              <ErrorView
                message="내 주문을 불러오지 못했어요."
                onRetry={() => void ordersQuery.refetch()}
              />
            ) : (
              <Box sx={fetchingSx(ordersQuery.isFetching)}>
                {orders.length === 0 ? (
                  <CommonEmptyState
                    message="아직 주문한 문집이 없어요. 완독한 책들로 우리 모임의 첫 문집을 만들어 보세요."
                    action={
                      <CommonButton
                        label="문집 만들기"
                        buttonColor="secondary"
                        onClick={() => router.push(ROUTES.orderNew)}
                      />
                    }
                  />
                ) : (
                  <Stack spacing={2}>
                    {orders.map((order) => (
                      <OrderCard key={order.publicId} order={order} />
                    ))}
                  </Stack>
                )}
                <CommonPagination
                  page={ordersPage}
                  totalCount={orderCount}
                  pageSize={MY_ORDERS_PAGE_SIZE}
                  onChange={setOrdersPage}
                />
              </Box>
            ))}
        </>
      )}
    </CommonContainer>
  );
}
