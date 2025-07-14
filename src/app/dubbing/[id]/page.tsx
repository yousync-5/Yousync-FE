"use client";
import { useRef, useEffect } from "react";

function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function TestPage() {
  return <div>Test Page</div>;
}
  