import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {detectSoftwareGl} from './glDetection';

const NOISE_GLSL = `
vec3 mod289_v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289_v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute_v4(vec4 x) { return mod289_v4(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt_v4(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise3d(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289_v3(i);
  vec4 p = permute_v4(permute_v4(permute_v4(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt_v4(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbmNoise(vec3 p) {
  float val = 0.0;
  float amp = 0.52;
  val += amp * snoise3d(p);
  val += (amp * 0.5) * snoise3d(p * 2.05);
  return val;
}
`;

export function DisplacementSphere() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      alpha: true,
    });
    const gl = renderer.getContext();
    const isSoftwareGl = detectSoftwareGl(gl);

    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75),
    );
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 220);
    camera.position.set(0, 0, 56);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    // Paired warm key light + cool fill + cyan accent rim
    const keyLight = new THREE.DirectionalLight('#fff2e2', 2.1);
    keyLight.position.set(36, 28, 32);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#8dc2ff', '#0b0e14', 0.9);
    scene.add(hemiLight);

    const cyanRimLight = new THREE.DirectionalLight('#00E5FF', 2.4);
    cyanRimLight.position.set(-42, -18, 22);
    scene.add(cyanRimLight);

    const uniforms = {
      uTime: {value: 0.4},
      uAmplitude: {value: 5.2},
    };

    const segments = isSoftwareGl ? 48 : 96;
    const geometry = new THREE.SphereGeometry(24, segments, segments);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#191e26'),
      roughness: 0.34,
      metalness: 0.62,
      envMapIntensity: 1.15,
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uAmplitude = uniforms.uAmplitude;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uTime;
          uniform float uAmplitude;
          ${NOISE_GLSL}
          vec3 displacePoint(vec3 p) {
            float n = fbmNoise(normalize(p) * 1.35 + vec3(uTime * 0.14, -uTime * 0.11, uTime * 0.09));
            return p + normalize(p) * (n * uAmplitude);
          }`,
        )
        .replace(
          '#include <beginnormal_vertex>',
          `#include <beginnormal_vertex>
          vec3 displacedPos = displacePoint(position);
          float eps = 0.25;
          vec3 tangentX = normalize(cross(abs(normal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), normal));
          vec3 bitangentY = normalize(cross(normal, tangentX));
          vec3 dPx = displacePoint(position + tangentX * eps) - displacedPos;
          vec3 dPy = displacePoint(position + bitangentY * eps) - displacedPos;
          objectNormal = normalize(cross(dPx, dPy));`,
        )
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          transformed = displacedPos;`,
        );
    };

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(width >= 768 ? 14 : 6, 1, 0);
    scene.add(sphere);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerCurrent = new THREE.Vector2(0, 0);

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      pointerTarget.set(nx * 0.36, ny * 0.28);
    };

    window.addEventListener('pointermove', onPointerMove, {passive: true});

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      width = Math.max(1, entry.contentRect.width);
      height = Math.max(1, entry.contentRect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      sphere.position.x = width >= 768 ? 14 : 5;
      renderer.render(scene, camera);
    });
    resizeObserver.observe(container);

    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
      },
      {threshold: 0.02},
    );
    visibilityObserver.observe(container);

    let disposed = false;
    let rafId: number | null = null;
    let paceTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastTime = performance.now();

    const afterDraw = (done: () => void) => {
      if (isSoftwareGl) {
        gl.finish();
        const rAF = requestAnimationFrame(() => {
          if (paceTimeout !== null) {
            clearTimeout(paceTimeout);
            paceTimeout = null;
          }
          done();
        });
        paceTimeout = setTimeout(() => {
          cancelAnimationFrame(rAF);
          paceTimeout = null;
          done();
        }, 1000);
        return;
      }
      rafId = requestAnimationFrame(done);
    };

    const tick = () => {
      if (disposed) {
        return;
      }
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (isVisible) {
        if (!prefersReducedMotion) {
          uniforms.uTime.value += dt * 0.72;
          sphere.rotation.y += dt * 0.09;
        }
        pointerCurrent.x = THREE.MathUtils.damp(pointerCurrent.x, pointerTarget.x, 4, dt);
        pointerCurrent.y = THREE.MathUtils.damp(pointerCurrent.y, pointerTarget.y, 4, dt);
        sphere.rotation.x = pointerCurrent.y;
        sphere.rotation.z = -pointerCurrent.x * 0.45;
        renderer.render(scene, camera);
      }

      if (!prefersReducedMotion) {
        afterDraw(tick);
      }
    };

    renderer.render(scene, camera);
    if (!prefersReducedMotion) {
      afterDraw(tick);
    }

    return () => {
      disposed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (paceTimeout !== null) {
        clearTimeout(paceTimeout);
      }
      window.removeEventListener('pointermove', onPointerMove);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      geometry.dispose();
      material.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-90"
    />
  );
}
