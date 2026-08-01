'use client';

// 운영자 모임 상세 — 조회 + 메모. 목록 화면 없이 주문·회원 상세에서 링크로 진입한다 (D-030 개정)
import { Box, Skeleton, Stack } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useAdminClubQuery } from '@/shared/api/adminApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CopyableId } from '@/shared/components/ui/CopyableId';
import { QueryErrorView } from '@/shared/components/ui/QueryErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { colorChips } from '@/shared/styles/colors';
import { formatDate } from '@/shared/utils/date';
import { AdminDetailShell } from '../../components/AdminDetailShell';
import { AdminBackLink } from '../../components/AdminBackLink';
import { AdminNoteCard } from '../../components/AdminNoteCard';
import { AdminOrderMiniList } from '../../components/AdminOrderMiniList';
import { AdminStatRow } from '../../components/AdminStatRow';

export default function AdminClubDetailPage() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const {
    data: club,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminClubQuery(clubId);

  if (!isAdmin) return null;

  if (isError)
    return (
      <AdminDetailShell>
        <QueryErrorView
          error={error}
          notFoundMessage="모임 정보를 찾을 수 없어요. 모임 ID가 잘못되었을 수 있어요."
          failMessage="모임 정보를 불러오지 못했어요."
          onRetry={() => void refetch()}
        >
          <CommonButton
            label="모임 관리로"
            buttonColor="tertiary"
            onClick={() => router.push(ROUTES.adminClubs)}
          />
        </QueryErrorView>
      </AdminDetailShell>
    );

  if (isLoading || !club)
    return (
      <AdminDetailShell>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} />
      </AdminDetailShell>
    );

  return (
    <AdminDetailShell>
      <AdminBackLink listLabel="모임 관리" listHref={ROUTES.adminClubs} />
      <VerticalGap size={12} />

      <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
        {club.name}
      </Typo>
      <VerticalGap size={4} />
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[600]}
        sx={{ wordBreak: 'keep-all' }}
      >
        {club.description}
      </Typo>
      <VerticalGap size={4} />
      <Typo token="text_r_12" color={colorChips.grayScale[500]}>
        {formatDate(club.createdAt)} 개설 · 초대코드 {club.inviteCode}
      </Typo>

      <VerticalGap size={12} />
      <CopyableId label="모임 ID" value={club.publicId} />

      <VerticalGap size={16} />
      <AdminStatRow
        stats={[
          { label: '멤버', value: `${club.memberCount}` },
          { label: '책', value: `${club.bookCount}` },
          { label: '문집 주문', value: `${club.orderCount}` },
        ]}
      />

      <VerticalGap size={24} />
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Typo token="text_sb_16">멤버 {club.members.length}명</Typo>
        <CommonButton
          label="이 모임 회원 목록"
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={() =>
            router.push(`${ROUTES.adminMembers}?clubId=${club.publicId}`)
          }
        />
      </Stack>
      <VerticalGap size={8} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {club.members.map((member) => (
          <Stack
            key={member.publicId}
            direction="row"
            spacing={1}
            onClick={() =>
              router.push(ROUTES.adminMemberDetail(member.publicId))
            }
            sx={{
              alignItems: 'center',
              p: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${colorChips.grayScale[200]}`,
              backgroundColor: colorChips.basic.white,
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: member.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {member.avatarEmoji}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typo token="text_m_14" color={colorChips.grayScale[800]} noWrap>
                {member.name}
                {member.role === 'LEADER' && (
                  <Typo
                    component="span"
                    token="text_m_12"
                    color={colorChips.primary[500]}
                  >
                    {' '}
                    모임장
                  </Typo>
                )}
              </Typo>
              <Typo token="text_r_12" color={colorChips.grayScale[500]}>
                {formatDate(member.joinedAt)} 가입
              </Typo>
            </Box>
          </Stack>
        ))}
      </Box>

      <VerticalGap size={24} />
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Typo token="text_sb_16">최근 문집 주문</Typo>
        <CommonButton
          label="이 모임 주문 목록"
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={() =>
            router.push(`${ROUTES.adminOrders}?clubId=${club.publicId}`)
          }
        />
      </Stack>
      <VerticalGap size={8} />
      <AdminOrderMiniList
        orders={club.recentOrders.map((order) => ({
          publicId: order.publicId,
          title: order.title,
          status: order.status,
          copies: order.copies,
          createdAt: order.createdAt,
          meta: order.memberName,
        }))}
        emptyMessage="아직 문집 주문이 없어요."
      />

      <VerticalGap size={24} />
      <AdminNoteCard
        target="club"
        publicId={club.publicId}
        note={club.adminNote}
      />
    </AdminDetailShell>
  );
}
