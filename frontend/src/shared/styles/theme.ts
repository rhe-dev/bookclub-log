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
        html: {
          // iOS 사파리 러버밴드(위아래 바운스) 방지 — 스크롤 자체에는 영향 없음
          overscrollBehavior: 'none',
          /*
           * 세로 스크롤바 자리를 항상 비워 둔다.
           * 창을 줄이면 텍스트가 접히며 높이가 바뀌어 스크롤바가 나타났다 사라지는데,
           * 그때마다 폭이 스크롤바 너비만큼 달라져 줄바꿈이 다시 뒤집히는 진동이 생긴다.
           * (오버레이 스크롤바를 쓰는 환경에서는 원래 자리를 차지하지 않아 영향이 없다.)
           */
          scrollbarGutter: 'stable',
        },
        body: {
          overscrollBehavior: 'none',
          /*
           * MUI Modal(메뉴·팝오버·다이얼로그)은 열릴 때 body에 overflow:hidden과 함께
           * 스크롤바 너비만큼 padding-right를 인라인으로 넣는다 — 스크롤바가 사라지며
           * 콘텐츠가 넓어지는 것을 막으려는 보정이다.
           * 하지만 위에서 scrollbar-gutter로 그 자리를 이미 붙박이로 비워 뒀으므로
           * 폭이 변하지 않는다. 보정이 이중으로 들어가 화면이 왼쪽으로 밀리고
           * 오른쪽에 빈 띠가 생겼다.
           * gutter를 지원하지 않는 환경(구형 사파리)에서는 MUI의 보정이 여전히 필요하므로
           * @supports로 막아 둔다. 인라인 스타일을 이기려면 !important가 필요하다.
           */
          '@supports (scrollbar-gutter: stable)': {
            paddingRight: '0 !important',
          },
        },
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
        tooltip: {
          margin: '0 !important',
          // 좁은 화면에서 툴팁이 화면을 크게 덮지 않도록 본문보다 작게
          fontSize: 11,
          lineHeight: 1.5,
          maxWidth: 260,
          '@media (max-width: 600px)': { fontSize: 10, maxWidth: 200 },
        },
      },
    },
    MuiMenu: {
      // 항목이 많은 드롭다운(주문 상태 12종)이 화면을 넘지 않게
      defaultProps: {
        slotProps: { paper: { sx: { maxHeight: 320 } } },
      },
    },
  },
});
