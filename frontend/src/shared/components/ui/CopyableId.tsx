'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { Typo } from '@/shared/components/ui/Typo';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';

interface CopyableIdProps {
  label: string;
  value: string;
  /** 여러 줄을 나란히 쓸 때 라벨 폭을 고정해 값의 시작점을 맞춘다 */
  labelWidth?: number;
  /** 해당 대상의 상세로 가는 버튼 — 운영자가 주문↔회원↔모임을 오갈 수 있게 */
  action?: React.ReactNode;
}

/** 식별자 한 줄 — 복사 버튼 포함. 운영자가 ID로 대조·검색할 때 쓴다 */
export const CopyableId = ({
  label,
  value,
  labelWidth = 50,
  action,
}: CopyableIdProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('복사할 수 없는 환경이에요. 직접 선택해 주세요.');
    }
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typo
        token="text_r_12"
        color={colorChips.grayScale[400]}
        sx={{ width: labelWidth, flexShrink: 0 }}
      >
        {label}
      </Typo>
      <Typo token="text_r_12" color={colorChips.grayScale[400]}>
        {value}
      </Typo>
      <Tooltip title={copied ? '복사했어요' : '복사'} placement="top">
        <IconButton
          size="small"
          onClick={handleCopy}
          aria-label={`${label} 복사`}
        >
          {copied ? (
            <CheckRoundedIcon
              sx={{ fontSize: 14, color: colorChips.system.success }}
            />
          ) : (
            <ContentCopyRoundedIcon
              sx={{ fontSize: 14, color: colorChips.grayScale[400] }}
            />
          )}
        </IconButton>
      </Tooltip>
      {action}
    </Stack>
  );
};
