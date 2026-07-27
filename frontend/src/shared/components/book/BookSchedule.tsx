'use client';

import { Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { formatDate, formatPeriod } from '@/shared/utils/date';

interface BookScheduleProps {
  periodFrom: string | null;
  periodTo: string | null;
  meetingDate: string | null;
}

/** 함께 읽는 기간·모임일 — 단어 단위 줄바꿈(keep-all) */
export const BookSchedule = ({
  periodFrom,
  periodTo,
  meetingDate,
}: BookScheduleProps) => {
  const period = formatPeriod(periodFrom, periodTo);
  const meeting = formatDate(meetingDate);
  if (!period && !meeting) return null;

  return (
    <Stack spacing={0.25}>
      {period && (
        <Typo
          token="text_m_12"
          color={colorChips.grayScale[600]}
          sx={{ wordBreak: 'keep-all' }}
        >
          함께 읽는 기간 {period}
        </Typo>
      )}
      {meeting && (
        <Typo
          token="text_m_12"
          color={colorChips.grayScale[600]}
          sx={{ wordBreak: 'keep-all' }}
        >
          모임일 {meeting}
        </Typo>
      )}
    </Stack>
  );
};
