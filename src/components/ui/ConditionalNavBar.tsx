"use client";

import React from "react";
import { NavBar } from "./NavBar";
import { usePathname } from "next/navigation";

/**
 * 조건부로 NavBar를 렌더링하는 컴포넌트
 * 
 * 특정 페이지에서만 NavBar를 숨깁니다.
 */
const ConditionalNavBar: React.FC = () => {
  const pathname = usePathname();

  // 특정 페이지에서만 NavBar 숨김
  const hideNavBarPaths = [
    '/login', // 로그인 페이지
    '/signup', // 회원가입 페이지
    '/landing', // 랜딩페이지
  ];

  // 로그인/회원가입/랜딩 페이지가 아닌 모든 페이지에서 NavBar 표시
  if (hideNavBarPaths.includes(pathname)) {
    return null;
  }

  return <NavBar animateOnMount={true} />;
};

export default ConditionalNavBar; 