import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';

// 루트 접근은 입장 화면으로 보낸다
export default function RootPage() {
  redirect(ROUTES.entry);
}
