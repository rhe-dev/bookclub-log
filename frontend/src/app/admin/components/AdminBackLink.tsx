'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { ButtonBase, Stack } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

interface AdminBackLinkProps {
  /** 이 상세가 속한 목록 — 항상 그 이름으로 이동한다 */
  listLabel: string;
  listHref: string;
}

/**
 * 상세 페이지 상단 이동 링크.
 *
 * 두 갈래를 나눠 둔다 — **뒤로**는 방금 있던 화면으로(주문 → 회원 → 클럽처럼 타고 왔을 때),
 * **○○ 관리**는 언제나 그 목록으로. 하나로 합치면 라벨과 실제 이동이 어긋난다
 * (회원 상세에서 넘어온 클럽 상세에서 '클럽 관리'를 눌렀는데 회원 상세로 가는 문제).
 */
export const AdminBackLink = ({ listLabel, listHref }: AdminBackLinkProps) => {
  const router = useRouter();

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <ButtonBase
        onClick={() =>
          window.history.length > 1 ? router.back() : router.push(listHref)
        }
        sx={{ borderRadius: 1, px: 0.5, py: 0.5, gap: 0.25 }}
      >
        <ArrowBackRoundedIcon
          sx={{ fontSize: 16, color: colorChips.grayScale[600] }}
        />
        <Typo token="text_m_14" color={colorChips.grayScale[600]}>
          뒤로
        </Typo>
      </ButtonBase>
      <Typo token="text_r_14" color={colorChips.grayScale[300]}>
        ·
      </Typo>
      <ButtonBase
        component={Link}
        href={listHref}
        sx={{ borderRadius: 1, px: 0.5, py: 0.5 }}
      >
        <Typo token="text_m_14" color={colorChips.grayScale[600]}>
          {listLabel}
        </Typo>
      </ButtonBase>
    </Stack>
  );
};
