import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createFallbackScreenTexture,
  createRadialShadowTexture,
  detectSoftwareGl,
} from './glDetection';

interface DeviceCanvas3DProps {
  variant: 'laptop' | 'phones';
  screenTexture: string;
  secondaryScreenTexture?: string;
  title: string;
}

function createRoundedPlaneShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return shape;
}

export function DeviceCanvas3D({
  variant,
  screenTexture,
  secondaryScreenTexture,
  title,
}: DeviceCanvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = container.clientWidth || 560;
    let height = container.clientHeight || 420;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const gl = renderer.getContext();
    const isSoftwareGl = detectSoftwareGl(gl);

    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
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
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.35, variant === 'laptop' ? 6.4 : 5.7);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const keyLight = new THREE.DirectionalLight('#fff4e6', 1.85);
    keyLight.position.set(4.5, 6.5, 5.5);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#9ec7ff', '#111419', 0.85);
    scene.add(hemiLight);

    const cyanRimLight = new THREE.DirectionalLight('#00E5FF', 1.15);
    cyanRimLight.position.set(-5.0, 2.2, -3.5);
    scene.add(cyanRimLight);

    const disposables: {dispose: () => void}[] = [];
    const deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    const maxAnisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy() || 1);
    const textureLoader = new THREE.TextureLoader();

    const loadScreenMaterial = (url: string, label: string) => {
      const fallbackTex = createFallbackScreenTexture(label);
      disposables.push(fallbackTex);
      const mat = new THREE.MeshBasicMaterial({
        map: fallbackTex,
        toneMapped: false,
      });
      disposables.push(mat);

      textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = maxAnisotropy;
          mat.map = tex;
          mat.needsUpdate = true;
          disposables.push(tex);
          requestRender();
        },
        undefined,
        () => {
          // Keep procedural CanvasTexture fallback on error
          requestRender();
        },
      );
      return mat;
    };

    const metalChassisMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#272b33'),
      roughness: 0.28,
      metalness: 0.84,
    });
    const darkAnodizedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#13161b'),
      roughness: 0.55,
      metalness: 0.45,
    });
    const glassBezelMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#090b0f'),
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    });
    const accentGlowMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00E5FF'),
      emissive: new THREE.Color('#00E5FF'),
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
    disposables.push(metalChassisMat, darkAnodizedMat, glassBezelMat, accentGlowMat);

    // Shadow plane underneath assembly
    const shadowTex = createRadialShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });
    const shadowGeo = new THREE.PlaneGeometry(4.8, 2.8);
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.28, 0);
    scene.add(shadowPlane);
    disposables.push(shadowTex, shadowMat, shadowGeo);

    if (variant === 'laptop') {
      // Multi-part Laptop Assembly
      const baseShape = createRoundedPlaneShape(3.3, 2.2, 0.12);
      const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
        depth: 0.075,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.018,
        bevelSegments: 3,
      });
      baseGeo.rotateX(Math.PI / 2);
      const baseMesh = new THREE.Mesh(baseGeo, metalChassisMat);
      baseMesh.position.set(0, -0.78, 0.42);
      deviceGroup.add(baseMesh);

      const keyboardGeo = new THREE.BoxGeometry(2.65, 0.016, 1.02);
      const keyboardMesh = new THREE.Mesh(keyboardGeo, darkAnodizedMat);
      keyboardMesh.position.set(0, -0.755, 0.18);
      deviceGroup.add(keyboardMesh);

      const trackpadGeo = new THREE.BoxGeometry(1.02, 0.012, 0.64);
      const trackpadMesh = new THREE.Mesh(trackpadGeo, darkAnodizedMat);
      trackpadMesh.position.set(0, -0.757, 1.08);
      deviceGroup.add(trackpadMesh);

      const hingeGeo = new THREE.CylinderGeometry(0.055, 0.055, 2.38, 24);
      hingeGeo.rotateZ(Math.PI / 2);
      const hingeMesh = new THREE.Mesh(hingeGeo, darkAnodizedMat);
      hingeMesh.position.set(0, -0.73, -0.68);
      deviceGroup.add(hingeMesh);

      // Hinged display lid group
      const lidPivot = new THREE.Group();
      lidPivot.position.set(0, -0.72, -0.68);
      lidPivot.rotation.x = -0.22;
      deviceGroup.add(lidPivot);

      const lidShape = createRoundedPlaneShape(3.3, 2.12, 0.11);
      const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 3,
      });
      const lidMesh = new THREE.Mesh(lidGeo, metalChassisMat);
      lidMesh.position.set(0, 1.07, -0.02);
      lidPivot.add(lidMesh);

      const bezelGeo = new THREE.PlaneGeometry(3.16, 1.98);
      const bezelMesh = new THREE.Mesh(bezelGeo, glassBezelMat);
      bezelMesh.position.set(0, 1.07, 0.041);
      lidPivot.add(bezelMesh);

      const screenGeo = new THREE.PlaneGeometry(3.0, 1.84);
      const screenMat = loadScreenMaterial(screenTexture, title);
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.position.set(0, 1.08, 0.045);
      lidPivot.add(screenMesh);

      const camGeo = new THREE.CircleGeometry(0.022, 16);
      const camMesh = new THREE.Mesh(camGeo, accentGlowMat);
      camMesh.position.set(0, 2.025, 0.046);
      lidPivot.add(camMesh);

      deviceGroup.rotation.set(0.16, -0.34, 0);
      deviceGroup.position.set(0, 0.14, 0);

      disposables.push(
        baseGeo,
        keyboardGeo,
        trackpadGeo,
        hingeGeo,
        lidGeo,
        bezelGeo,
        screenGeo,
        camGeo,
      );
    } else {
      // Multi-part Dual Smartphone Assembly
      const buildPhone = (texUrl: string, label: string) => {
        const phone = new THREE.Group();
        const frameShape = createRoundedPlaneShape(1.18, 2.38, 0.14);
        const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
          depth: 0.085,
          bevelEnabled: true,
          bevelThickness: 0.016,
          bevelSize: 0.016,
          bevelSegments: 3,
        });
        const frameMesh = new THREE.Mesh(frameGeo, metalChassisMat);
        frameMesh.position.z = -0.042;
        phone.add(frameMesh);

        const glassGeo = new THREE.PlaneGeometry(1.1, 2.28);
        const glassMesh = new THREE.Mesh(glassGeo, glassBezelMat);
        glassMesh.position.z = 0.06;
        phone.add(glassMesh);

        const screenGeo = new THREE.PlaneGeometry(1.03, 2.18);
        const screenMat = loadScreenMaterial(texUrl, label);
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.z = 0.064;
        phone.add(screenMesh);

        const speakerGeo = new THREE.BoxGeometry(0.24, 0.024, 0.01);
        const speakerMesh = new THREE.Mesh(speakerGeo, accentGlowMat);
        speakerMesh.position.set(0, 1.05, 0.066);
        phone.add(speakerMesh);

        disposables.push(frameGeo, glassGeo, screenGeo, speakerGeo);
        return phone;
      };

      const frontPhone = buildPhone(screenTexture, title);
      frontPhone.position.set(-0.56, 0.1, 0.35);
      frontPhone.rotation.set(-0.08, 0.24, 0.04);

      const backPhone = buildPhone(
        secondaryScreenTexture || screenTexture,
        `${title} Mobile`,
      );
      backPhone.position.set(0.62, -0.1, -0.25);
      backPhone.rotation.set(0.06, -0.26, -0.05);

      deviceGroup.add(backPhone, frontPhone);
      deviceGroup.rotation.set(0.08, -0.18, 0);
    }

    const baseRotX = deviceGroup.rotation.x;
    const baseRotY = deviceGroup.rotation.y;
    const targetTilt = new THREE.Vector2(0, 0);
    const currentTilt = new THREE.Vector2(0, 0);

    let disposed = false;
    let rafId: number | null = null;
    let lastTime = performance.now();
    let entryProgress = prefersReducedMotion ? 1 : 0;

    function renderFrame() {
      if (disposed) {
        return;
      }
      renderer.render(scene, camera);
    }

    function step(now: number) {
      rafId = null;
      if (disposed) {
        return;
      }
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (entryProgress < 1) {
        entryProgress = Math.min(1, entryProgress + dt * 1.45);
      }

      currentTilt.x = THREE.MathUtils.damp(currentTilt.x, targetTilt.x, 7, dt);
      currentTilt.y = THREE.MathUtils.damp(currentTilt.y, targetTilt.y, 7, dt);

      const easedEntry = 1 - Math.pow(1 - entryProgress, 3);
      deviceGroup.rotation.x = baseRotX + currentTilt.y + (1 - easedEntry) * 0.22;
      deviceGroup.rotation.y = baseRotY + currentTilt.x - (1 - easedEntry) * 0.35;
      deviceGroup.position.y =
        (variant === 'laptop' ? 0.14 : 0) - (1 - easedEntry) * 0.25;

      renderFrame();

      const settled =
        entryProgress >= 1 &&
        Math.abs(currentTilt.x - targetTilt.x) < 0.0008 &&
        Math.abs(currentTilt.y - targetTilt.y) < 0.0008;

      if (!settled && !prefersReducedMotion) {
        rafId = requestAnimationFrame(step);
      }
    }

    function requestRender() {
      if (disposed) {
        return;
      }
      if (prefersReducedMotion) {
        renderFrame();
        return;
      }
      if (rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetTilt.set(nx * 0.24, ny * 0.16);
      requestRender();
    };

    const onPointerLeave = () => {
      targetTilt.set(0, 0);
      requestRender();
    };

    container.addEventListener('pointermove', onPointerMove, {passive: true});
    container.addEventListener('pointerleave', onPointerLeave);

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
      renderFrame();
    });
    resizeObserver.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          requestRender();
        }
      },
      {threshold: 0.15},
    );
    io.observe(container);

    requestRender();

    return () => {
      disposed = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      resizeObserver.disconnect();
      io.disconnect();
      disposables.forEach((item) => item.dispose());
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant, screenTexture, secondaryScreenTexture, title]);

  return (
    <div
      ref={mountRef}
      aria-label={`Interactive 3D ${variant === 'laptop' ? 'laptop' : 'mobile'} mockup for ${title}`}
      className="relative h-[320px] w-full cursor-grab active:cursor-grabbing sm:h-[400px] lg:h-[460px]"
    />
  );
}
