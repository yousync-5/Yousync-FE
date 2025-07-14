<<<<<<< HEAD
=======
"use client";

import React, { useRef, useEffect } from "react";

function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

>>>>>>> fix/landingsize
