"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface WebGLScriptProgressBarProps {
  currentScriptIndex: number;
  totalScripts: number;
  width?: number;
  height?: number;
  theme?: 'dark' | 'light';
  animation?: boolean;
  showPercentage?: boolean;
  label?: string;
}

// 프로젝트 테마 색상
const THEME_COLORS = {
  dark: {
    background: '#101112',
    barBg: '#232626',
    barFill: '#22ff88',
    barAccent: '#6cd4ff',
    text: '#eaeaea',
    subText: '#929ca5'
  },
  light: {
    background: '#ffffff',
    barBg: '#e5e7eb',
    barFill: '#22ff88',
    barAccent: '#6cd4ff',
    text: '#1f2937',
    subText: '#6b7280'
  }
};

export default function WebGLScriptProgressBar({ 
  currentScriptIndex,
  totalScripts,
  width = 600, 
  height = 30, 
  theme = 'dark',
  animation = true,
  showPercentage = true,
  label = ''
}: WebGLScriptProgressBarProps) {
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
      setAnimatedValue((currentScriptIndex + 1) / totalScripts);
      return;
    }

    const startValue = animatedValue;
    const endValue = (currentScriptIndex + 1) / totalScripts;
    const startTime = performance.now();
    const duration = 800; // 0.8초로 단축

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
  }, [currentScriptIndex, totalScripts, animation]);

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

    // 셰이더 소스 - 그라데이션과 파티클 효과
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      attribute float a_alpha;
      attribute float a_time;
      attribute float a_scriptIndex;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_time;
      varying float v_scriptIndex;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = a_color;
        v_alpha = a_alpha;
        v_time = a_time;
        v_scriptIndex = a_scriptIndex;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_time;
      varying float v_scriptIndex;
      
      void main() {
        // 글로우 효과
        float glow = 0.3 * sin(gl_FragCoord.x * 0.02 + v_time * 1.5) + 0.7;
        
        // 스크립트별 파티클 효과
        float particle = sin(gl_FragCoord.x * 0.05 + v_time * 2.0 + v_scriptIndex * 10.0) * 0.15 + 0.85;
        
        // 그라데이션 효과
        float gradient = sin(gl_FragCoord.x * 0.01 + v_time * 0.5) * 0.1 + 0.9;
        
        vec3 finalColor = v_color * glow * particle * gradient;
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

  // 스크립트 진행도 바 렌더링
  const renderScriptProgressBar = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program || !isClient) return;

    const colors = THEME_COLORS[theme];
    const currentTime = performance.now() * 0.001; // 초 단위
    
    // 배경색 설정
    gl.clearColor(
      parseInt(colors.background.slice(1, 3), 16) / 255,
      parseInt(colors.background.slice(3, 5), 16) / 255,
      parseInt(colors.background.slice(5, 7), 16) / 255,
      1.0
    );
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 전체 배경 그리기
    drawBackground(gl, program, colors);
    
    // 스크립트별 구역 그리기
    drawScriptSections(gl, program, colors, currentTime);
    
    // 진행도 채우기 그리기
    drawProgressFill(gl, program, colors, animatedValue, currentTime);
    
    // 글로우 효과 그리기
    drawGlowEffect(gl, program, animatedValue, currentTime);
  }, [animatedValue, theme, isClient, totalScripts]);

  // 배경 그리기
  const drawBackground = (gl: WebGLRenderingContext, program: WebGLProgram, colors: any) => {
    const bgColor = [
      parseInt(colors.barBg.slice(1, 3), 16) / 255,
      parseInt(colors.barBg.slice(3, 5), 16) / 255,
      parseInt(colors.barBg.slice(5, 7), 16) / 255
    ];

    const vertices = new Float32Array([
      -0.95, -0.4, ...bgColor, 0.8, 0.0, 0.0,
      -0.95, 0.4, ...bgColor, 0.8, 0.0, 0.0,
      0.95, 0.4, ...bgColor, 0.8, 0.0, 0.0,
      0.95, -0.4, ...bgColor, 0.8, 0.0, 0.0
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    const timeLocation = gl.getAttribLocation(program, 'a_time');
    const scriptIndexLocation = gl.getAttribLocation(program, 'a_scriptIndex');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    gl.enableVertexAttribArray(timeLocation);
    gl.enableVertexAttribArray(scriptIndexLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 32, 20);
    gl.vertexAttribPointer(timeLocation, 1, gl.FLOAT, false, 32, 24);
    gl.vertexAttribPointer(scriptIndexLocation, 1, gl.FLOAT, false, 32, 28);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 스크립트별 구역 그리기
  const drawScriptSections = (gl: WebGLRenderingContext, program: WebGLProgram, colors: any, currentTime: number) => {
    const sectionColor = [
      parseInt(colors.barAccent.slice(1, 3), 16) / 255,
      parseInt(colors.barAccent.slice(3, 5), 16) / 255,
      parseInt(colors.barAccent.slice(5, 7), 16) / 255
    ];

    const sectionWidth = 1.9 / totalScripts; // 전체 너비를 스크립트 수로 나눔

    for (let i = 0; i < totalScripts; i++) {
      const startX = -0.95 + (i * sectionWidth);
      const endX = startX + sectionWidth;
      
      // 구역 경계선 (더 얇게)
      const vertices = new Float32Array([
        startX, -0.3, ...sectionColor, 0.2, currentTime, i,
        startX, 0.3, ...sectionColor, 0.2, currentTime, i,
        endX, 0.3, ...sectionColor, 0.2, currentTime, i,
        endX, -0.3, ...sectionColor, 0.2, currentTime, i
      ]);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const colorLocation = gl.getAttribLocation(program, 'a_color');
      const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
      const timeLocation = gl.getAttribLocation(program, 'a_time');
      const scriptIndexLocation = gl.getAttribLocation(program, 'a_scriptIndex');
      
      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(colorLocation);
      gl.enableVertexAttribArray(alphaLocation);
      gl.enableVertexAttribArray(timeLocation);
      gl.enableVertexAttribArray(scriptIndexLocation);
      
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 32, 0);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 32, 8);
      gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 32, 20);
      gl.vertexAttribPointer(timeLocation, 1, gl.FLOAT, false, 32, 24);
      gl.vertexAttribPointer(scriptIndexLocation, 1, gl.FLOAT, false, 32, 28);
      
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
  };

  // 진행도 채우기 그리기
  const drawProgressFill = (gl: WebGLRenderingContext, program: WebGLProgram, colors: any, fillValue: number, currentTime: number) => {
    const fillColor = [
      parseInt(colors.barFill.slice(1, 3), 16) / 255,
      parseInt(colors.barFill.slice(3, 5), 16) / 255,
      parseInt(colors.barFill.slice(5, 7), 16) / 255
    ];

    // 채우기 너비 계산 - 정확한 진행률 반영
    const fillWidth = Math.min(fillValue * 1.9, 1.9); // -0.95에서 0.95까지, 최대값 제한

    const vertices = new Float32Array([
      -0.95, -0.2, ...fillColor, 0.95, currentTime, currentScriptIndex,
      -0.95, 0.2, ...fillColor, 0.95, currentTime, currentScriptIndex,
      -0.95 + fillWidth, 0.2, ...fillColor, 0.95, currentTime, currentScriptIndex,
      -0.95 + fillWidth, -0.2, ...fillColor, 0.95, currentTime, currentScriptIndex
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    const timeLocation = gl.getAttribLocation(program, 'a_time');
    const scriptIndexLocation = gl.getAttribLocation(program, 'a_scriptIndex');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    gl.enableVertexAttribArray(timeLocation);
    gl.enableVertexAttribArray(scriptIndexLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 32, 20);
    gl.vertexAttribPointer(timeLocation, 1, gl.FLOAT, false, 32, 24);
    gl.vertexAttribPointer(scriptIndexLocation, 1, gl.FLOAT, false, 32, 28);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 글로우 효과 그리기
  const drawGlowEffect = (gl: WebGLRenderingContext, program: WebGLProgram, fillValue: number, currentTime: number) => {
    const glowColor = [
      0.133, // #22ff88의 R
      1.0,   // #22ff88의 G
      0.533  // #22ff88의 B
    ];

    const fillWidth = fillValue * 1.9;
    const glowIntensity = fillValue * 0.4; // 진행도에 따른 글로우 강도

    // 글로우 효과 (더 큰 사각형, 낮은 알파)
    const vertices = new Float32Array([
      -0.95, -0.45, ...glowColor, glowIntensity, currentTime, currentScriptIndex,
      -0.95, 0.45, ...glowColor, glowIntensity, currentTime, currentScriptIndex,
      -0.95 + fillWidth, 0.45, ...glowColor, glowIntensity, currentTime, currentScriptIndex,
      -0.95 + fillWidth, -0.45, ...glowColor, glowIntensity, currentTime, currentScriptIndex
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const alphaLocation = gl.getAttribLocation(program, 'a_alpha');
    const timeLocation = gl.getAttribLocation(program, 'a_time');
    const scriptIndexLocation = gl.getAttribLocation(program, 'a_scriptIndex');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    gl.enableVertexAttribArray(alphaLocation);
    gl.enableVertexAttribArray(timeLocation);
    gl.enableVertexAttribArray(scriptIndexLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 32, 8);
    gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 32, 20);
    gl.vertexAttribPointer(timeLocation, 1, gl.FLOAT, false, 32, 24);
    gl.vertexAttribPointer(scriptIndexLocation, 1, gl.FLOAT, false, 32, 28);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  };

  // 애니메이션 루프
  const animate = useCallback(() => {
    if (!animation || !isClient) return;
    
    renderScriptProgressBar();
    animationRef.current = requestAnimationFrame(animate);
  }, [renderScriptProgressBar, animation, isClient]);

  // 컴포넌트 마운트
  useEffect(() => {
    if (!isClient) return;
    
    initWebGL();
    
    // 초기 렌더링
    setTimeout(() => {
      renderScriptProgressBar();
    }, 100);

    if (animation) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, renderScriptProgressBar, animate, animation, isClient]);

  // 값 변경 시 재렌더링
  useEffect(() => {
    if (isClient) {
      renderScriptProgressBar();
    }
  }, [animatedValue, renderScriptProgressBar, isClient]);

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
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {label} {Math.round(animatedValue * 100)}%
          </span>
        </div>
      )}
    </div>
  );
} 