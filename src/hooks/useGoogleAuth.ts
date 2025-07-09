import { useEffect } from "react";

export function useGoogleAuth(onSuccess: (token: string) => void) {
  useEffect(() => {
    // 실제 구글 OAuth 로직을 여기에 작성
    // 예시: window.gapi, Google Identity Services 등
  }, [onSuccess]);
} 