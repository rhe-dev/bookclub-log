'use client';

// 운영자 회원 상세 — 조회 + 메모. 주문·클럽 상세와 오갈 수 있는 페이지 (D-037)
import { Box, Skeleton, Stack } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useAdminMemberQuery } from '@/shared/api/adminApi';
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

export default function AdminMemberDetailPage() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  const { memberId } = useParams<{ memberId: string }>();
  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminMemberQuery(memberId);

  if (!isAdmin) return null;

  if (isError)
    return (
      <AdminDetailShell>
        <QueryErrorView
          error={error}
          notFoundMessage="회원 정보를 찾을 수 없어요. 회원 ID가 잘못되었을 수 있어요."
          failMessage="회원 정보를 불러오지 못했어요."
          onRetry={() => void refetch()}
        >
          <CommonButton
            label="회원 관리로"
            buttonColor="tertiary"
            onClick={() => router.push(ROUTES.adminMembers)}
          />
        </QueryErrorView>
      </AdminDetailShell>
    );

  if (isLoading || !member)
    return (
      <AdminDetailShell>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} />
      </AdminDetailShell>
    );

  return (
    <AdminDetailShell>
      <AdminBackLink listLabel="회원 관리" listHref={ROUTES.adminMembers} />
      <VerticalGap size={12} />

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: member.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {member.avatarEmoji}
        </Box>
        <Box>
          <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
            {member.name}
          </Typo>
          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            {formatDate(member.createdAt)} 가입
          </Typo>
        </Box>
      </Stack>

      <VerticalGap size={12} />
      <CopyableId label="회원 ID" value={member.publicId} />

      <VerticalGap size={16} />
      <AdminStatRow
        stats={[
          { label: '가입 클럽', value: `${member.clubs.length}` },
          { label: '코멘트', value: `${member.commentCount}` },
          { label: '공감', value: `${member.likeCount}` },
          { label: '문집 주문', value: `${member.orderCount}` },
        ]}
      />

      <VerticalGap size={24} />
      <Typo token="text_sb_16">가입 클럽</Typo>
      <VerticalGap size={8} />
      {member.clubs.length === 0 ? (
        <Typo token="text_r_14" color={colorChips.grayScale[500]}>
          가입한 클럽이 없어요.
        </Typo>
      ) : (
        <Stack spacing={1}>
          {member.clubs.map((club) => (
            <Stack
              key={club.publicId}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${colorChips.grayScale[200]}`,
                backgroundColor: colorChips.basic.white,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typo token="text_m_14" color={colorChips.grayScale[800]}>
                  {club.name}
                  {club.role === 'LEADER' && (
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
                  {formatDate(club.joinedAt)} 가입
                </Typo>
              </Box>
              <CommonButton
                label="클럽 상세"
                size="small"
                buttonColor="tertiary"
                buttonVariant="outlined"
                onClick={() =>
                  router.push(ROUTES.adminClubDetail(club.publicId))
                }
              />
            </Stack>
          ))}
        </Stack>
      )}

      <VerticalGap size={24} />
      <Typo token="text_sb_16">최근 문집 주문</Typo>
      <VerticalGap size={8} />
      <AdminOrderMiniList
        orders={member.recentOrders.map((order) => ({
          publicId: order.publicId,
          title: order.title,
          status: order.status,
          copies: order.copies,
          createdAt: order.createdAt,
          meta: order.clubName,
        }))}
        emptyMessage="아직 문집을 주문한 적이 없어요."
      />

      <VerticalGap size={24} />
      <AdminNoteCard
        target="member"
        publicId={member.publicId}
        note={member.adminNote}
      />
    </AdminDetailShell>
  );
}
