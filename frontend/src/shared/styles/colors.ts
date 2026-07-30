/**
 * 컬러 토큰 — 서비스 팔레트의 단일 소스.
 * primary(#2B6CB0)·secondary(#B0662C)는 스위트북 서비스에서 실측한 값.
 * TS/TSX에서는 임의 hex 리터럴 대신 colorChips만 사용한다.
 */
export const colorChips = {
  primary: {
    100: '#D9E6F5',
    300: '#5B8FC7',
    500: '#2B6CB0',
    700: '#245C97',
  },
  secondary: {
    100: '#F3E4D7',
    300: '#C98A55',
    500: '#B0662C',
    700: '#8F5223',
  },
  basic: {
    white: '#FFFFFF',
    black: '#111111',
  },
  grayScale: {
    50: '#F9FAFC',
    100: '#F5F7FA',
    200: '#E8EDF3',
    300: '#D5DCE5',
    400: '#B3BCC8',
    500: '#8C95A3',
    600: '#6B727F',
    700: '#4E5560',
    800: '#333842',
    900: '#111111',
  },
  system: {
    error: '#C53030',
    errorDark: '#9B2C2C',
    errorBg: '#FDEAEA',
    success: '#2F855A',
    successBg: '#E3F2E8',
    warning: '#B7791F',
    info: '#2B6CB0',
    disabledBg: '#E8EDF3',
    disabledText: '#B3BCC8',
  },
} as const;
