'use client';

import { createTheme } from '@mui/material/styles';
import { colorChips } from './colors';

/** MUI 테마 — 팔레트는 colorChips 토큰(단일 소스)에서 가져온다 */
export const theme = createTheme({
  palette: {
    primary: {
      main: colorChips.primary[500],
      dark: colorChips.primary[700],
      light: colorChips.primary[300],
      contrastText: colorChips.basic.white,
    },
    secondary: {
      main: colorChips.secondary[500],
      dark: colorChips.secondary[700],
      light: colorChips.secondary[300],
      contrastText: colorChips.basic.white,
    },
    error: {
      main: colorChips.system.error,
      dark: colorChips.system.errorDark,
    },
    success: { main: colorChips.system.success },
    warning: { main: colorChips.system.warning },
    info: { main: colorChips.system.info },
    background: {
      default: colorChips.grayScale[100],
      paper: colorChips.basic.white,
    },
    text: {
      primary: colorChips.basic.black,
      secondary: colorChips.grayScale[600],
    },
    divider: colorChips.grayScale[200],
  },
  typography: {
    fontFamily: [
      "'Pretendard Variable'",
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'Roboto',
      "'Noto Sans KR'",
      'sans-serif',
    ].join(', '),
    button: { fontWeight: 600 },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // iOS 사파리 러버밴드(위아래 바운스) 방지 — 스크롤 자체에는 영향 없음
        html: { overscrollBehavior: 'none' },
        body: { overscrollBehavior: 'none' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTooltip: {
      // 화살표를 달고 대상에 붙인다 — 기본값은 툴팁 자체 margin까지 더해져 멀리 떠 보인다
      defaultProps: {
        arrow: true,
        slotProps: {
          popper: {
            modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
          },
        },
      },
      styleOverrides: {
        // popper offset으로만 간격을 정하도록 툴팁 자체 여백은 제거
        tooltip: { margin: '0 !important' },
      },
    },
  },
});
