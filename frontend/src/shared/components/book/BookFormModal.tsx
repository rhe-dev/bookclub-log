'use client';

import { Box, ButtonBase, Chip, Stack } from '@mui/material';
import { useState } from 'react';
import {
  useCreateBookMutation,
  useUpdateBookMutation,
} from '@/shared/api/bookApi';
import { useClubMembersQuery } from '@/shared/api/clubApi';
import { BookCover } from '@/shared/components/book/BookCover';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { BOOK_STATUS_LABEL } from '@/shared/constants/bookStatus';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Book, BookStatus } from '@/shared/types/book';

// 표지 색상은 UI 토큰이 아니라 콘텐츠 값(책 표지의 색) — colorChips 규칙의 의도적 예외
const COVER_COLORS = [
  '#2B6CB0',
  '#B0662C',
  '#2F855A',
  '#C53030',
  '#6B46C1',
  '#B7791F',
  '#1F6E8C',
  '#4E5560',
];

const COVER_EMOJIS = [
  '📕',
  '📗',
  '📘',
  '📙',
  '📚',
  '🌙',
  '🌊',
  '🌿',
  '🔥',
  '⭐',
  '🕯️',
  '🧳',
  '🌰',
  '🏪',
  '🐟',
  '🎈',
];

const STATUS_OPTIONS: BookStatus[] = ['UPCOMING', 'READING', 'DONE'];

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

interface BookFormModalProps {
  open: boolean;
  onClose: () => void;
  clubPublicId?: string;
  /** 전달하면 수정 모드 */
  book?: Book;
}

/** 책 추가/수정 모달 — 서지정보·표지(색+이모지)·상태·일정·참여 회원 (PLAN F1) */
export const BookFormModal = ({
  open,
  onClose,
  clubPublicId,
  book,
}: BookFormModalProps) => {
  const isEdit = Boolean(book);
  const { data: members } = useClubMembersQuery(clubPublicId);
  const createMutation = useCreateBookMutation(clubPublicId);
  const updateMutation = useUpdateBookMutation(book?.publicId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [coverEmoji, setCoverEmoji] = useState(COVER_EMOJIS[0]);
  const [status, setStatus] = useState<BookStatus>('UPCOMING');
  const [periodFrom, setPeriodFrom] = useState('');
  const [periodTo, setPeriodTo] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    author?: string;
    participants?: string;
  }>({});

  // 열 때마다 초기화 — 수정 모드는 기존 값, 추가 모드는 기본값(참여 회원 전체 선택).
  // 이펙트 대신 렌더 중 상태 조정 — members가 재검증돼도 입력 중인 폼이 리셋되지 않는다
  const formKey = `${open}-${book?.publicId ?? 'new'}`;
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (open && formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setTitle(book?.title ?? '');
    setAuthor(book?.author ?? '');
    setPublisher(book?.publisher ?? '');
    setCoverColor(book?.coverColor ?? COVER_COLORS[0]);
    setCoverEmoji(book?.coverEmoji ?? COVER_EMOJIS[0]);
    setStatus(book?.status ?? 'UPCOMING');
    setPeriodFrom(toDateInput(book?.periodFrom));
    setPeriodTo(toDateInput(book?.periodTo));
    setMeetingDate(toDateInput(book?.meetingDate));
    setParticipantIds(
      book
        ? book.participants.map((p) => p.publicId)
        : (members?.map((m) => m.publicId) ?? []),
    );
    setErrors({});
  }

  const toggleParticipant = (publicId: string) => {
    if (errors.participants)
      setErrors((prev) => ({ ...prev, participants: undefined }));
    setParticipantIds((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId],
    );
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = '책 제목을 입력해 주세요.';
    if (!author.trim()) nextErrors.author = '저자를 입력해 주세요.';
    // 참여 회원이 없으면 문집에 실을 사람도, 토론할 사람도 정해지지 않는다
    if (participantIds.length === 0)
      nextErrors.participants = '참여 회원을 한 명 이상 선택해 주세요.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const options = {
      onSuccess: () => {
        toast.success(isEdit ? '책 정보를 수정했어요.' : '책을 추가했어요.');
        onClose();
      },
    };

    if (isEdit) {
      // 수정 모드: 비운 값은 null로 보내 '해제'
      updateMutation.mutate(
        {
          title: title.trim(),
          author: author.trim(),
          publisher: publisher.trim() || null,
          coverColor,
          coverEmoji,
          status,
          periodFrom: periodFrom || null,
          periodTo: periodTo || null,
          meetingDate: meetingDate || null,
          participantIds,
        },
        options,
      );
      return;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        author: author.trim(),
        publisher: publisher.trim() || undefined,
        coverColor,
        coverEmoji,
        status,
        periodFrom: periodFrom || undefined,
        periodTo: periodTo || undefined,
        meetingDate: meetingDate || undefined,
        participantIds,
      },
      options,
    );
  };

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title={isEdit ? '책 정보 수정' : '책 추가'}
      disableBackdropClose
      actions={
        <>
          <CommonButton label="취소" buttonColor="tertiary" onClick={onClose} />
          <CommonButton
            label={isEdit ? '저장' : '책 추가'}
            onClick={handleSubmit}
            isLoading={isPending}
          />
        </>
      }
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <CommonInput
          label="책 제목 *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          errorMessage={errors.title}
          maxLength={200}
        />
        <Stack direction="row" spacing={1.5}>
          <CommonInput
            label="저자 *"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            errorMessage={errors.author}
            maxLength={100}
          />
          <CommonInput
            label="출판사"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            maxLength={100}
          />
        </Stack>

        {/* 좁은 화면에서 미리보기 + 팔레트를 가로로 두면 이모지 그리드가 넘쳐 모달에 가로 스크롤이 생긴다 */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          sx={{ alignItems: 'flex-start' }}
        >
          <BookCover
            color={coverColor}
            emoji={coverEmoji}
            width={72}
            fontSize={32}
            borderRadius={2}
          />
          <Stack spacing={1.5} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <Box>
              <Typo token="text_m_12" color={colorChips.grayScale[600]}>
                표지 색
              </Typo>
              <VerticalGap size={6} />
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {COVER_COLORS.map((color) => (
                  <ButtonBase
                    key={color}
                    onClick={() => setCoverColor(color)}
                    aria-label={`표지 색 ${color}`}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: color,
                      border:
                        color === coverColor
                          ? `3px solid ${colorChips.grayScale[800]}`
                          : `3px solid transparent`,
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <Box>
              <Typo token="text_m_12" color={colorChips.grayScale[600]}>
                표지 이모지
              </Typo>
              <VerticalGap size={6} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(6, minmax(0, 1fr))',
                    sm: 'repeat(8, minmax(0, 1fr))',
                  },
                  gap: 0.5,
                }}
              >
                {COVER_EMOJIS.map((emoji) => (
                  <ButtonBase
                    key={emoji}
                    onClick={() => setCoverEmoji(emoji)}
                    sx={{
                      height: 32,
                      borderRadius: 1.5,
                      fontSize: 18,
                      backgroundColor:
                        emoji === coverEmoji
                          ? colorChips.primary[100]
                          : 'transparent',
                    }}
                  >
                    {emoji}
                  </ButtonBase>
                ))}
              </Box>
            </Box>
          </Stack>
        </Stack>

        <Box>
          <Typo token="text_m_12" color={colorChips.grayScale[600]}>
            상태
          </Typo>
          <VerticalGap size={6} />
          <Stack direction="row" spacing={1}>
            {STATUS_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={BOOK_STATUS_LABEL[option]}
                onClick={() => setStatus(option)}
                color={status === option ? 'primary' : 'default'}
                variant={status === option ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Box>

        {/* 좁은 화면에서 날짜 3개를 가로로 두면 라벨·값이 모두 잘린다 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <CommonInput
            label="함께 읽기 시작"
            type="date"
            value={periodFrom}
            onChange={(e) => setPeriodFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <CommonInput
            label="함께 읽기 끝"
            type="date"
            value={periodTo}
            onChange={(e) => setPeriodTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <CommonInput
            label="모임일"
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>

        <Box>
          {/* 다른 필드의 인라인 에러와 같은 문법 — 라벨도 함께 붉어진다 */}
          <Typo
            token="text_m_12"
            color={
              errors.participants
                ? colorChips.system.error
                : colorChips.grayScale[600]
            }
          >
            참여 회원 *
          </Typo>
          <VerticalGap size={6} />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {members?.map((m) => {
              const selected = participantIds.includes(m.publicId);
              return (
                <Chip
                  key={m.publicId}
                  label={`${m.avatarEmoji} ${m.name}`}
                  onClick={() => toggleParticipant(m.publicId)}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                />
              );
            })}
          </Stack>
          {errors.participants && (
            <>
              <VerticalGap size={6} />
              <Typo token="text_r_12" color={colorChips.system.error}>
                {errors.participants}
              </Typo>
            </>
          )}
        </Box>
      </Stack>
    </CommonModal>
  );
};
