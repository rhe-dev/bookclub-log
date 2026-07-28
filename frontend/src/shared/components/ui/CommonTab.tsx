'use client';

import { Tab, Tabs } from '@mui/material';
import { colorChips } from '@/shared/styles/colors';

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface CommonTabProps<T extends string> {
  /** 현재 탭 값 */
  currentVal: T;
  /** 탭 배열 — value는 문자열 유니온으로 좁혀 사용 */
  tabs: TabItem<T>[];
  handleChange: (tabName: T) => void;
}

/** 공통 탭 바 — 균등 폭 + 하단 인디케이터. 값·변경 콜백만 받는 컨트롤드 컴포넌트 */
export const CommonTab = <T extends string>({
  currentVal,
  tabs,
  handleChange,
}: CommonTabProps<T>) => (
  <Tabs
    value={currentVal}
    onChange={(_, tabName: T) => handleChange(tabName)}
    variant="fullWidth"
    sx={{
      borderBottom: `1px solid ${colorChips.grayScale[200]}`,
      '& .MuiTabs-indicator': {
        height: 3,
        backgroundColor: colorChips.primary[500],
      },
      '& .MuiTab-root': {
        fontSize: 15,
        fontWeight: 500,
        color: colorChips.grayScale[500],
        wordBreak: 'keep-all',
        '&.Mui-selected': {
          color: colorChips.primary[500],
          fontWeight: 600,
        },
      },
    }}
  >
    {tabs.map((tab) => (
      <Tab key={tab.value} value={tab.value} label={tab.label} />
    ))}
  </Tabs>
);
