"use client";

import React from "react";
import { NavBar } from "./NavBar";
import { usePathname } from "next/navigation";
import { useVisitCheck } from "@/hooks/useSessionStorage";

/**
 * 조건부로 NavBar를 렌더링하는 컴포넌트
 * 
 * 특정 페이지에서만 NavBar를 숨깁니다.
 */
const ConditionalNavBar: React.FC = () => {
  const pathname = usePathname();
  const { hasVisited, isInitialized } = useVisitCheck();

  // 특정 페이지에서 NavBar 숨김
  const hideNavBarPaths = [
    '/login', // 로그인 페이지
    '/signup', // 회원가입 페이지
  ];

  // 랜딩 중일 때 NavBar 숨김 (최초 방문이고 아직 홈으로 이동하지 않은 경우)
  const isLanding = pathname === '/' && isInitialized && !hasVisited;

  if (hideNavBarPaths.includes(pathname) || isLanding) {
    return null;
  }

  // 그 외 모든 페이지에서 NavBar 표시
  return <NavBar animateOnMount={true} />;
};

export default ConditionalNavBar; 