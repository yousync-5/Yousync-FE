"use client";

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface WebGLGraphProps {
  data: number[];
  width?: number;
  height?: number;
  theme?: 'dark' | 'light';
  animation?: boolean;
}

// 프로젝트 테마 색상
const THEME_COLORS = {
  dark: {
    background: '#101112',
    grid: '#232626',
    line: '#22ff88',
    accent: '#6cd4ff',
    text: '#eaeaea',
    subText: '#929ca5'
  },
  light: {
    background: '#ffffff',
    grid: '#e5e7eb',
    line: '#22ff88',
    accent: '#6cd4ff',
    text: '#1f2937',
    subText: '#6b7280'
  }
};

export default function WebGLGraph({ 
  data, 
  width = 400, 
  height = 200, 
  theme = 'dark',
  animation = true 
}: WebGLGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

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

    // 간단한 셰이더 소스
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec3 a_color;
      varying vec3 v_color;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_color = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec3 v_color;
      
      void main() {
        gl_FragColor = vec4(v_color, 1.0);
      }
    `;

    // 셰이더 컴파일
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // 프로그램 생성
    const program = createProgram(gl, vertexShader, fragmentShader);
    programRef.current = program;

    gl.useProgram(program);
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

  // 그래프 데이터 렌더링
  const renderGraph = useCallback(() => {
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

    // 그리드 그리기
    drawGrid(gl, program, colors);
    
    // 데이터 라인 그리기
    if (data.length > 0) {
      drawDataLine(gl, program, data, colors);
    }
  }, [data, theme, isClient]);

  // 그리드 그리기
  const drawGrid = (gl: WebGLRenderingContext, program: WebGLProgram, colors: any) => {
    const gridColor = [
      parseInt(colors.grid.slice(1, 3), 16) / 255,
      parseInt(colors.grid.slice(3, 5), 16) / 255,
      parseInt(colors.grid.slice(5, 7), 16) / 255
    ];

    // 수직 그리드 라인
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * 2 - 1;
      const vertices = new Float32Array([
        x, -1, ...gridColor,
        x, 1, ...gridColor
      ]);
      
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const colorLocation = gl.getAttribLocation(program, 'a_color');
      
      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(colorLocation);
      
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);
      
      gl.drawArrays(gl.LINES, 0, 2);
    }

    // 수평 그리드 라인
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * 2 - 1;
      const vertices = new Float32Array([
        -1, y, ...gridColor,
        1, y, ...gridColor
      ]);
      
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const colorLocation = gl.getAttribLocation(program, 'a_color');
      
      gl.enableVertexAttribArray(positionLocation);
      gl.enableVertexAttribArray(colorLocation);
      
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);
      
      gl.drawArrays(gl.LINES, 0, 2);
    }
  };

  // 데이터 라인 그리기
  const drawDataLine = (gl: WebGLRenderingContext, program: WebGLProgram, data: number[], colors: any) => {
    if (data.length < 2) return;

    const lineColor = [
      parseInt(colors.line.slice(1, 3), 16) / 255,
      parseInt(colors.line.slice(3, 5), 16) / 255,
      parseInt(colors.line.slice(5, 7), 16) / 255
    ];

    const vertices: number[] = [];
    
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * 2 - 1;
      const y = (value * 2) - 1;
      
      vertices.push(x, y, ...lineColor);
    });

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);
    
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 20, 8);
    
    gl.drawArrays(gl.LINE_STRIP, 0, data.length);
  };

  // 애니메이션 루프
  const animate = useCallback(() => {
    if (!animation || !isClient) return;
    
    renderGraph();
    animationRef.current = requestAnimationFrame(animate);
  }, [renderGraph, animation, isClient]);

  // 컴포넌트 마운트
  useEffect(() => {
    if (!isClient) return;
    
    initWebGL();
    
    // 초기 렌더링
    setTimeout(() => {
      renderGraph();
    }, 100);

    if (animation) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initWebGL, renderGraph, animate, animation, isClient]);

  // 데이터 변경 시 재렌더링
  useEffect(() => {
    if (data.length > 0 && isClient) {
      renderGraph();
    }
  }, [data, renderGraph, isClient]);

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
          background: THEME_COLORS[theme].background,
          width: `${width}px`,
          height: `${height}px`
        }}
      />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          데이터 로딩 중...
        </div>
      )}
    </div>
  );
} 