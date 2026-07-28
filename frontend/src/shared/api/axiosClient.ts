import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { useMemberStore } from '@/shared/stores/memberStore';
import { toast } from '@/shared/stores/toastStore';

const apiInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/** 백엔드 전역 에러 포맷(D-018)에서 사용자 메시지를 꺼낸다 */
export function getErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const messages = (error.response?.data as { messages?: string[] })
      ?.messages;
    if (messages?.length) return messages;
    if (!error.response) return ['네트워크 연결을 확인해 주세요.'];
  }
  return ['요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'];
}

// Request: 무인증 멤버 컨텍스트 — 선택된 멤버의 publicId를 X-Member-Id로 전달 (D-017)
apiInstance.interceptors.request.use((config) => {
  const member = useMemberStore.getState().member;
  if (member) config.headers['X-Member-Id'] = member.publicId;
  return config;
});

// 백엔드 ErrorMessage.MEMBER_NOT_FOUND와 동일 문자열 — 세션 무효 감지용
const MEMBER_NOT_FOUND_MESSAGE = '멤버를 찾을 수 없습니다.';

// Response: 전역 에러 토스트 — 폼 인라인 표시가 필요한 곳은 skipErrorToast로 제외
apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 세션의 멤버가 서버에 없으면(DB 초기화 등) 자동 로그아웃 — 무효 세션으로 계속 실패하는 것 방지
    if (
      error.response?.status === 404 &&
      getErrorMessages(error).includes(MEMBER_NOT_FOUND_MESSAGE) &&
      useMemberStore.getState().member
    ) {
      useMemberStore.getState().logout();
      toast.error(
        '로그인 정보가 더 이상 유효하지 않아요. 다시 로그인해 주세요.',
      );
      return Promise.reject(error);
    }
    if (!axios.isCancel(error) && !error.config?.skipErrorToast) {
      toast.error(getErrorMessages(error)[0]);
    }
    return Promise.reject(error);
  },
);

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** true면 응답 인터셉터의 전역 에러 토스트를 건너뛴다 (폼 인라인 표시용) */
    skipErrorToast?: boolean;
  }
}

async function get<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return apiInstance.get<T>(url, config);
}

async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return apiInstance.post<T>(url, data, config);
}

async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return apiInstance.patch<T>(url, data, config);
}

async function del<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> {
  return apiInstance.delete<T>(url, config);
}

/** 직접 axios 대신 사용하는 래퍼 — 타입 명시·일관 인터페이스·모킹 용이 (delete는 예약어라 del) */
export const axiosClient = { get, post, patch, del };
