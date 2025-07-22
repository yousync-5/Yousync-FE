"use client";

import React from "react";
import { NavBar } from "./NavBar";
import { usePathname } from "next/navigation";

/**
 * 모든 페이지에 NavBar를 고정적으로 렌더링하는 컴포넌트
 * 
 * 방문 여부와 상관없이 항상 NavBar를 표시합니다.
 */
const ConditionalNavBar: React.FC = () => {
  const pathname = usePathname();

  // 항상 NavBar 표시 (애니메이션 효과 제거)
  return <NavBar animateOnMount={false} />;
};

export default ConditionalNavBar; 