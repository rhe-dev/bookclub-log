import { redirect } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';

// /admin 진입은 주문 관리로 — 운영자의 기본 작업 화면 (D-029)
export default function AdminHomePage() {
  redirect(ROUTES.adminOrders);
}
