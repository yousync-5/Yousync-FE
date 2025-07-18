"use client";

import React from "react";
import { NavBar } from "./NavBar";
import { useVisitCheck } from "@/hooks/useSessionStorage";
import { usePathname } from "next/navigation";

/**
 * 방문 체크를 통해 조건부로 NavBar를 렌더링하는 컴포넌트
 * 
 * 최초 방문 시에는 NavBar를 숨기고, 재방문 시에만 표시합니다.
 */
const ConditionalNavBar: React.FC = () => {
  const { hasVisited, isInitialized } = useVisitCheck();
  const pathname = usePathname();

  // 초기화가 완료되지 않았거나 최초 방문인 경우 NavBar 숨김
  if (!isInitialized) {
    return null;
  }

  // 최초 방문인 경우 NavBar 숨김 (Let's run 화면에서는 navbar 불필요)
  if (!hasVisited) {
    return null;
  }

  // 재방문인 경우에만 NavBar 표시
  return <NavBar animateOnMount={true} />;
};

export default ConditionalNavBar; 