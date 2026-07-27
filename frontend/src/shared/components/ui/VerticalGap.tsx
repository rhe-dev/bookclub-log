import { Box } from '@mui/material';

/**
 * 세로 여백 — 레이아웃 간격은 margin·Stack spacing 대신 이 컴포넌트로 명시한다.
 * 여백이 어디에 얼마나 들어갔는지 코드에서 바로 보이게 하기 위함.
 */
export const VerticalGap = ({ size }: { size: number }) => {
  return <Box aria-hidden sx={{ height: size, flexShrink: 0 }} />;
};
