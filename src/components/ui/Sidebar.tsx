"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Loader from './Loader';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  captions: { script: string }[];
  currentScriptIndex: number;
  onScriptSelect: (index: number) => void;
  actorName?: string;
  movieTitle?: string;
  analyzedCount?: number;
  totalCount?: number;
  recording?: boolean;
  onStopLooping?: () => void;
  recordedScripts?: boolean[];
  latestResultByScript?: Record<string, any>; // 추가
  recordingCompleted?: boolean; // 추가
}

function normalizeScript(str: string) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function Sidebar({
  isOpen,
  onClose,
  captions,
  currentScriptIndex,
  onScriptSelect,
  recording = false,
  onStopLooping,
  recordedScripts = [],
  latestResultByScript = {},
  recordingCompleted = false,
}: SidebarProps) {
  // 사이드바 비활성화 - 빈 div 반환
  return <div></div>;
}