'use client';

// 임시 쇼케이스 — 공통컴포넌트·테마 확인용. 입장 화면 구현 시 대체 예정.
import { Box, Container, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { Header } from '@/shared/components/layout/Header';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Club, ClubMember } from '@/shared/types/club';

const BUTTON_COLORS = ['primary', 'secondary', 'error', 'tertiary'] as const;

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const setMember = useMemberStore((s) => s.setMember);

  const previewHeaderMember = async () => {
    const { data: clubs } = await axiosClient.get<Club[]>('/clubs');
    const { data: members } = await axiosClient.get<ClubMember[]>(
      `/clubs/${clubs[0].publicId}/members`,
    );
    setMember(members[0]);
    toast.success(`${members[0].name} 멤버로 헤더 미리보기`);
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          북클럽 로그
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          공통컴포넌트 쇼케이스 (임시 페이지)
        </Typography>

        <Stack spacing={3} sx={{ mt: 4 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Typo — 타이포 토큰
            </Typography>
            <Typo token="text_b_24">text_b_24 제목</Typo>
            <Typo token="text_sb_18" color={colorChips.primary[500]}>
              text_sb_18 primary500
            </Typo>
            <Typo token="text_m_16" color={colorChips.grayScale[600]}>
              text_m_16 gray600 본문
            </Typo>
            <Typo token="text_r_12" color={colorChips.grayScale[500]}>
              text_r_12 gray500 캡션
            </Typo>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              CommonButton — 3색 × filled/outlined
            </Typography>
            {BUTTON_COLORS.map((color) => (
              <Stack key={color} direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                <CommonButton label={`${color} filled`} buttonColor={color} />
                <CommonButton
                  label={`${color} outlined`}
                  buttonColor={color}
                  buttonVariant="outlined"
                />
              </Stack>
            ))}
            <CommonButton label="로딩 중" isLoading />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              CommonInput
            </Typography>
            <Stack spacing={2}>
              <CommonInput
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={10}
              />
              <CommonInput
                label="에러 상태"
                errorMessage="내용을 입력해 주세요."
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Header — 상단 확인 (멤버 미리보기 후 칩 메뉴)
            </Typography>
            <CommonButton
              label="실제 멤버로 헤더 미리보기"
              buttonColor="tertiary"
              onClick={previewHeaderMember}
            />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              CommonToast / CommonModal
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <CommonButton
                label="성공 토스트"
                onClick={() => toast.success('저장했어요!')}
              />
              <CommonButton
                label="에러 토스트"
                buttonColor="error"
                buttonVariant="outlined"
                onClick={() => toast.error('요청에 실패했습니다.')}
              />
              <CommonButton
                label="모달 열기"
                buttonVariant="outlined"
                onClick={() => setModalOpen(true)}
              />
            </Stack>
          </Box>
        </Stack>

        <CommonModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="모달 제목"
          actions={
            <>
              <CommonButton
                label="취소"
                buttonVariant="outlined"
                onClick={() => setModalOpen(false)}
              />
              <CommonButton label="확인" onClick={() => setModalOpen(false)} />
            </>
          }
        >
          <Typography>모달 내용 영역입니다.</Typography>
        </CommonModal>
      </Container>
    </>
  );
}
