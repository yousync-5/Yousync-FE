"use client";

import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
// import { GoogleLoginButton } from "react-social-login-buttons";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 실제 구글 로그인 로직
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokenResponse.access_token);
        router.push("/");
      }
    },
    onError: () => {
      // 에러 무시 (UI에 표시하지 않음)
    },
  });

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0A1A16] via-[#102F26] to-black">
        <div className="w-full max-w-sm sm:max-w-md mx-auto p-4">
          {/* 카드 */}
          <div className="bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-900/40 px-8 py-10 flex flex-col items-center">
            {/* 로고/타이틀 */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
                <span className="text-emerald-400">You</span>Sync
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl font-medium mt-1">
                AI 더빙 & 피치 분석 서비스
              </p>
            </div>
            {/* 로그인 안내 */}
            <div className="mb-7 w-full">
              <button
                onClick={() => login()}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-emerald-100 active:bg-emerald-200 transition font-semibold text-gray-800 shadow-md text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading}
              >
                <FcGoogle className="text-2xl" />
                <span>Google로 로그인</span>
              </button>
            </div>
            {/* 안내문구 */}
            <div className="w-full text-center mt-2">
              <p className="text-gray-400 text-sm mb-2">
                로그인하지 않아도 일부 기능을 체험할 수 있습니다.
              </p>
              <button
                onClick={() => router.push('/')} 
                className="text-emerald-300 hover:text-white text-sm underline transition font-medium"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}