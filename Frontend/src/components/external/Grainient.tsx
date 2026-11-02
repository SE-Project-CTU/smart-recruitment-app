import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import "./Grainient.css";

export interface GrainientProps extends HTMLAttributes<HTMLDivElement> {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  colors?: string[];
  className?: string;
  style?: CSSProperties;
}

const hexToRgb = (hex?: string): [number, number, number] => {
  if (!hex) return [1, 1, 1];
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16) / 255;
    const g = parseInt(cleaned[1] + cleaned[1], 16) / 255;
    const b = parseInt(cleaned[2] + cleaned[2], 16) / 255;
    return [
      Number.isNaN(r) ? 1 : r,
      Number.isNaN(g) ? 1 : g,
      Number.isNaN(b) ? 1 : b,
    ];
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(-1.0 + 2.0 * hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(-1.0 + 2.0 * hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(-1.0 + 2.0 * hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
  return 0.5 + 0.5 * n;
}

void mainImage(out vec4 o, vec2 C) {
  float t = iTime * uTimeSpeed;
  vec2 uv = C / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;
  vec2 tuv = uv - 0.5 + uCenterOffset;
  tuv /= max(uZoom, 0.001);

  float degree = noise(vec2(t * 0.1, tuv.x * tuv.y) * uNoiseScale);
  tuv.y *= 1.0 / ratio;
  tuv *= Rot(radians((degree - 0.5) * uRotationAmount + 180.0));
  tuv.y *= ratio;

  float frequency = uWarpFrequency;
  float ws = max(uWarpStrength, 0.001);
  float amplitude = uWarpAmplitude / ws;
  float warpTime = t * uWarpSpeed;
  tuv.x += sin(tuv.y * frequency + warpTime) / amplitude;
  tuv.y += sin(tuv.x * (frequency * 1.5) + warpTime) / (amplitude * 0.5);

  vec3 colLav = uColor1;
  vec3 colOrg = uColor2;
  vec3 colDark = uColor3;
  float b = uColorBalance;
  float s = max(uBlendSoftness, 0.0);
  mat2 blendRot = Rot(radians(uBlendAngle));
  float blendX = (tuv * blendRot).x;
  float edge0 = -0.3 - b - s;
  float edge1 = 0.2 - b + s;
  float v0 = 0.5 - b + s;
  float v1 = -0.3 - b - s;
  vec3 layer1 = mix(colDark, colOrg, S(edge0, edge1, blendX));
  vec3 layer2 = mix(colOrg, colLav, S(edge0, edge1, blendX));
  vec3 col = mix(layer1, layer2, S(v0, v1, tuv.y));

  vec2 grainUv = uv * max(uGrainScale, 0.001);
  if (uGrainAnimated > 0.5) {
    grainUv += vec2(iTime * 0.05);
  }
  float grain = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * uGrainAmount;

  col = (col - 0.5) * uContrast + 0.5;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, uSaturation);
  col = pow(max(col, 0.0), vec3(1.0 / max(uGamma, 0.001)));
  col = clamp(col, 0.0, 1.0);

  o = vec4(col, 1.0);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  fragColor = o;
}
`;

export default function Grainient({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.05,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.3,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1,
  color2,
  color3,
  colors,
  className = "",
  style,
  ...rest
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve colors with fallbacks
  const c1 = color1 ?? colors?.[0] ?? "#0353a4";
  const c2 = color2 ?? colors?.[1] ?? "#5390d9";
  const c3 = color3 ?? colors?.[2] ?? "#48bfe3";

  // Keep latest props in a ref for the animation loop
  const propsRef = useRef({
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
    c1,
    c2,
    c3,
  });

  propsRef.current = {
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
    c1,
    c2,
    c3,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      console.warn("WebGL2 not supported for Grainient component");
      return;
    }

    // Compile Vertex Shader
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vShader) return;
    gl.shaderSource(vShader, VERTEX_SHADER);
    gl.compileShader(vShader);
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
      console.error(
        "Vertex shader compilation failed:",
        gl.getShaderInfoLog(vShader),
      );
      gl.deleteShader(vShader);
      return;
    }

    // Compile Fragment Shader
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fShader) {
      gl.deleteShader(vShader);
      return;
    }
    gl.shaderSource(fShader, FRAGMENT_SHADER);
    gl.compileShader(fShader);
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader compilation failed:",
        gl.getShaderInfoLog(fShader),
      );
      gl.deleteShader(vShader);
      gl.deleteShader(fShader);
      return;
    }

    // Link Program
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vShader);
      gl.deleteShader(fShader);
      return;
    }
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.deleteShader(vShader);
    gl.deleteShader(fShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    // Full-screen triangle geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
      gl.STATIC_DRAW,
    );

    const posAttrLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrLoc);
    gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uLocs = {
      iTime: gl.getUniformLocation(program, "iTime"),
      iResolution: gl.getUniformLocation(program, "iResolution"),
      uTimeSpeed: gl.getUniformLocation(program, "uTimeSpeed"),
      uColorBalance: gl.getUniformLocation(program, "uColorBalance"),
      uWarpStrength: gl.getUniformLocation(program, "uWarpStrength"),
      uWarpFrequency: gl.getUniformLocation(program, "uWarpFrequency"),
      uWarpSpeed: gl.getUniformLocation(program, "uWarpSpeed"),
      uWarpAmplitude: gl.getUniformLocation(program, "uWarpAmplitude"),
      uBlendAngle: gl.getUniformLocation(program, "uBlendAngle"),
      uBlendSoftness: gl.getUniformLocation(program, "uBlendSoftness"),
      uRotationAmount: gl.getUniformLocation(program, "uRotationAmount"),
      uNoiseScale: gl.getUniformLocation(program, "uNoiseScale"),
      uGrainAmount: gl.getUniformLocation(program, "uGrainAmount"),
      uGrainScale: gl.getUniformLocation(program, "uGrainScale"),
      uGrainAnimated: gl.getUniformLocation(program, "uGrainAnimated"),
      uContrast: gl.getUniformLocation(program, "uContrast"),
      uGamma: gl.getUniformLocation(program, "uGamma"),
      uSaturation: gl.getUniformLocation(program, "uSaturation"),
      uCenterOffset: gl.getUniformLocation(program, "uCenterOffset"),
      uZoom: gl.getUniformLocation(program, "uZoom"),
      uColor1: gl.getUniformLocation(program, "uColor1"),
      uColor2: gl.getUniformLocation(program, "uColor2"),
      uColor3: gl.getUniformLocation(program, "uColor3"),
    };

    let animationFrameId: number;
    const startTime = performance.now();

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      const renderWidth = Math.round(width * dpr);
      const renderHeight = Math.round(height * dpr);

      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
      }
      gl.viewport(0, 0, renderWidth, renderHeight);
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    const render = (currentTime: number) => {
      const p = propsRef.current;
      const elapsedTime = (currentTime - startTime) * 0.001;

      gl.useProgram(program);

      // Pass uniforms
      if (uLocs.iTime) gl.uniform1f(uLocs.iTime, elapsedTime);
      if (uLocs.iResolution)
        gl.uniform2f(uLocs.iResolution, canvas.width, canvas.height);
      if (uLocs.uTimeSpeed) gl.uniform1f(uLocs.uTimeSpeed, p.timeSpeed);
      if (uLocs.uColorBalance)
        gl.uniform1f(uLocs.uColorBalance, p.colorBalance);
      if (uLocs.uWarpStrength)
        gl.uniform1f(uLocs.uWarpStrength, p.warpStrength);
      if (uLocs.uWarpFrequency)
        gl.uniform1f(uLocs.uWarpFrequency, p.warpFrequency);
      if (uLocs.uWarpSpeed) gl.uniform1f(uLocs.uWarpSpeed, p.warpSpeed);
      if (uLocs.uWarpAmplitude)
        gl.uniform1f(uLocs.uWarpAmplitude, p.warpAmplitude);
      if (uLocs.uBlendAngle) gl.uniform1f(uLocs.uBlendAngle, p.blendAngle);
      if (uLocs.uBlendSoftness)
        gl.uniform1f(uLocs.uBlendSoftness, p.blendSoftness);
      if (uLocs.uRotationAmount)
        gl.uniform1f(uLocs.uRotationAmount, p.rotationAmount);
      if (uLocs.uNoiseScale) gl.uniform1f(uLocs.uNoiseScale, p.noiseScale);
      if (uLocs.uGrainAmount) gl.uniform1f(uLocs.uGrainAmount, p.grainAmount);
      if (uLocs.uGrainScale) gl.uniform1f(uLocs.uGrainScale, p.grainScale);
      if (uLocs.uGrainAnimated)
        gl.uniform1f(uLocs.uGrainAnimated, p.grainAnimated ? 1.0 : 0.0);
      if (uLocs.uContrast) gl.uniform1f(uLocs.uContrast, p.contrast);
      if (uLocs.uGamma) gl.uniform1f(uLocs.uGamma, p.gamma);
      if (uLocs.uSaturation) gl.uniform1f(uLocs.uSaturation, p.saturation);
      if (uLocs.uCenterOffset)
        gl.uniform2f(uLocs.uCenterOffset, p.centerX, p.centerY);
      if (uLocs.uZoom) gl.uniform1f(uLocs.uZoom, p.zoom);

      const rgb1 = hexToRgb(p.c1);
      const rgb2 = hexToRgb(p.c2);
      const rgb3 = hexToRgb(p.c3);
      if (uLocs.uColor1) gl.uniform3f(uLocs.uColor1, rgb1[0], rgb1[1], rgb1[2]);
      if (uLocs.uColor2) gl.uniform3f(uLocs.uColor2, rgb2[0], rgb2[1], rgb2[2]);
      if (uLocs.uColor3) gl.uniform3f(uLocs.uColor3, rgb3[0], rgb3[1], rgb3[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`grainient-container${className ? ` ${className}` : ""}`}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="grainient-canvas" aria-hidden="true" />
    </div>
  );
}
