"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface WebGLGaugeProps {
  value: number; // 0-1 사이의 값
  width?: number;
  height?: number;
  theme?: 'dark' | 'light';
  animation?: boolean;
  label?: string;
}

// 프로젝트 테마 색상
const THEME_COLORS = {
  dark: {
    background: '#101112',
    gaugeBg: '#232626',
    gaugeFill: '#22ff88',
    gaugeAccent: '#6cd4ff',
    text: '#eaeaea',
    subText: '#929ca5'
  },
  light: {
    background: '#ffffff',
    gaugeBg: '#e5e7eb',
    gaugeFill: '#22ff88',
    gaugeAccent: '#6cd4ff',
    text: '#1f2937',
    subText: '#6b7280'
  }
};

// 정확도에 따른 색상 계산
const getAccuracyColor = (value: number) => {
  // 값이 0-100 사이인지 0-1 사이인지 확인하고 정규화
  const normalizedValue = value > 1 ? value / 100 : value;
  
  if (normalizedValue < 0.3) {
    // 빨강 (0-30%)
    return {
      r: 255,
      g: Math.round(255 * (normalizedValue / 0.3)),
      b: 0
    };
  } else if (normalizedValue < 0.7) {
    // 노랑 (30-70%)
    const t = (normalizedValue - 0.3) / 0.4;
    return {
      r: 255,
      g: 255,
      b: Math.round(255 * t)
    };
  } else {
    // 초록 (70-100%)
    const t = (normalizedValue - 0.7) / 0.3;
    return {
      r: Math.round(255 * (1 - t)),
      g: 255,
      b: 0
    };
  }
};

export default function WebGLGauge({ 
  value, 
  width = 200, 
  height = 60, 
  theme = 'dark',
  animation = true,
  label = ''
}: WebGLGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 애니메이션 값 업데이트
  useEffect(() => {
    if (!animation) {
      setAnimatedValue(value);
      return;
    }

    const startValue = animatedValue;
    const endValue = value;
    const startTime = performance.now();
    const duration = 1000; // 1초

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic - 자연스러운 감속
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animation]);

  // WebGL 초기화
  const initWebGL = useCallback(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') as WebGLRenderingContext;
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;
    
    // 캔버스 크기 설정
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 셰이더 소스 - 글로우 효과 추가
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_alpha;
      varying vec3 v_color;
      varying float v_alpha;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = a_color;
        v_alpha = a_alpha;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;
      varying float v_alpha;
      
      void main() {
        // 글로우 효과
        float glow = 0.3 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1) + 0.7;
        vec3 finalColor = v_color * glow;
        gl_FragColor = vec4(finalColor, v_alpha);
      }
    `;

    // 셰이더 컴파일
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // 프로그램 생성
    const program = createProgram(gl, vertexShader, fragmentShader);
    programRef.current = program;

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }, [width, height, isClient]);

  // 셰이더 생성 함수
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    
    return shader;
  };

  // 프로그램 생성 함수
  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create program');
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    
    return program;
  };

  // 게이지 렌더링
  const renderGauge = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program || !isClient) return;

    const colors = THEME_COLORS[theme];
    
    // 배경색 설정
    gl.clearColor(
      parseInt(colors.background.slice(1, 3), 16) / 255,
      parseInt(colors.background.slice(3, 5), 16) / 255,
      parseInt(colors.background.slice(5, 7), 16) / 255,
      1.0
    );
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 게이지 배경 그리기
    drawGaugeBackground(gl, program, colors);
    
    // 게이지 채우기 그리기 (정확도 색상 적용)
    drawGaugeFill(gl, program, animatedValue);
    
    // 글로우 효과 그리기
    drawGlowEffect(gl, program, animatedValue);
  }, [animatedValue, theme, isClient]);

  // 게이지 배경 그리기
  const drawGaugeBackground = (gl: WebGLRenderingContext, program: WebGLProgram, colors: any) => {
    const bgColor = [
      parseInt(colors.gaugeBg.slice(1, 3), 16) / 255,
      parseInt(colors.gaugeBg.slice(3, 5), 16) / 255,
      parseInt(colors.gaugeBg.slice(5, 7), 16) / 255
    ];

    // 둥근 사각형 배경
    const vertices = new Float32Array([
      -0.9, -0.3, ...bgColor, 1.0,
      -0.9, 0.3, ...bgColor, 1.0,
      0.9, 0.3, ...bgColor, 1.0,
      0.9, -0.3, ...bgColor, 1.0
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 24, 20);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 게이지 채우기 그리기 (정확도 색상)
  const drawGaugeFill = (gl: WebGLRenderingContext, program: WebGLProgram, fillValue: number) => {
    const accuracyColor = getAccuracyColor(fillValue);
    const fillColor = [
      accuracyColor.r / 255,
      accuracyColor.g / 255,
      accuracyColor.b / 255
    ];

    // 채우기 너비 계산
    const fillWidth = fillValue * 1.8; // -0.9에서 0.9까지

    const vertices = new Float32Array([
      -0.9, -0.25, ...fillColor, 0.9,
      -0.9, 0.25, ...fillColor, 0.9,
      -0.9 + fillWidth, 0.25, ...fillColor, 0.9,
      -0.9 + fillWidth, -0.25, ...fillColor, 0.9
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 24, 20);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 글로우 효과 그리기
  const drawGlowEffect = (gl: WebGLRenderingContext, program: WebGLProgram, fillValue: number) => {
    const accuracyColor = getAccuracyColor(fillValue);
    const glowColor = [
      accuracyColor.r / 255,
      accuracyColor.g / 255,
      accuracyColor.b / 255
    ];

    const fillWidth = fillValue * 1.8;
    const glowIntensity = fillValue * 0.3; // 정확도에 따른 글로우 강도

    // 글로우 효과 (더 큰 사각형, 낮은 알파)
    const vertices = new Float32Array([
      -0.9, -0.35, ...glowColor, glowIntensity,
      -0.9, 0.35, ...glowColor, glowIntensity,
      -0.9 + fillWidth, 0.35, ...glowColor, glowIntensity,
      -0.9 + fillWidth, -0.35, ...glowColor, glowIntensity
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 24, 20);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 애니메이션 루프
  const animate = useCallback(() => {
    if (!animation || !isClient) return;
    
    renderGauge();
    animationRef.current = requestAnimationFrame(animate);
  }, [renderGauge, animation, isClient]);

  // 컴포넌트 마운트
  useEffect(() => {
    if (!isClient) return;
    
    initWebGL();
    
    // 초기 렌더링
    setTimeout(() => {
      renderGauge();
    }, 100);

    if (animation) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, renderGauge, animate, animation, isClient]);

  // 값 변경 시 재렌더링
  useEffect(() => {
    if (isClient) {
      renderGauge();
    }
  }, [animatedValue, renderGauge, isClient]);

  // SSR 중에는 로딩 표시
  if (!isClient) {
    return (
      <div 
        className="border border-gray-700 rounded-lg flex items-center justify-center"
        style={{ 
          background: THEME_COLORS[theme].background,
          width: `${width}px`,
          height: `${height}px`
        }}
      >
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg"
        style={{ 
          width: `${width}px`,
          height: `${height}px`
        }}
      />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {label}: {Math.round(animatedValue * 100)}%
          </span>
        </div>
      )}
    </div>
  );
} 