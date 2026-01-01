import * as THREE from 'three';

export function detectSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rawRenderer = ext
      ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string | null)
      : (gl.getParameter(gl.RENDERER) as string | null);
    const label = (rawRenderer || '').toLowerCase();
    return /swiftshader|llvmpipe|software rasterizer|microsoft basic render/.test(label);
  } catch {
    return false;
  }
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createFallbackScreenTexture(title: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 1024, 640);
    bg.addColorStop(0, '#14171c');
    bg.addColorStop(1, '#0c0d10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 640);

    // Subtle UI grid bars
    ctx.fillStyle = 'rgba(0, 229, 255, 0.14)';
    ctx.fillRect(56, 56, 180, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(56, 110, 420, 22);
    ctx.fillRect(56, 156, 912, 260);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.fillRect(56, 444, 440, 140);
    ctx.fillRect(528, 444, 440, 140);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '600 22px monospace';
    ctx.fillText(title.slice(0, 40), 76, 210);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
