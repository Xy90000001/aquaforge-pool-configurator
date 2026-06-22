import * as THREE from 'three';

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function generatePlasterAlbedo(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rng = seededRandom(42);

  ctx.fillStyle = '#e4eaf2';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3000; i++) {
    const x = rng() * size, y = rng() * size;
    const rad = 2 + rng() * 16;
    const v = 0.47 + rng() * 0.06;
    ctx.fillStyle = `rgba(${Math.round(v*255)},${Math.round(v*255)},${Math.round(v*255)},${0.02 + rng()*0.04})`;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI*2); ctx.fill();
  }
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.03 + rng()*0.06})`;
    ctx.beginPath(); ctx.arc(rng()*size, rng()*size, 1 + rng()*3, 0, Math.PI*2); ctx.fill();
  }
  return c;
}

function generateMosaicAlbedo(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rng = seededRandom(77);

  const grid = 48;
  const tw = size / grid, gw = 2;
  ctx.fillStyle = '#2d3540';
  ctx.fillRect(0, 0, size, size);

  for (let r = 0; r < grid; r++) {
    for (let col = 0; col < grid; col++) {
      const x = col * tw + gw, y = r * tw + gw;
      const w = tw - gw*2, h = tw - gw*2;
      const v = 0.03;
      const cr = 0.12 + (rng()-0.5)*v*2;
      const cg = 0.80 + (rng()-0.5)*v*2;
      const cb = 0.91 + (rng()-0.5)*v*2;
      ctx.fillStyle = `rgb(${Math.round(cr*255)},${Math.round(cg*255)},${Math.round(cb*255)})`;
      ctx.fillRect(x, y, w, h);
    }
  }

  for (let r = 0; r < grid; r++) {
    for (let col = 0; col < grid; col++) {
      const x = col * tw + gw, y = r * tw + gw;
      const g = ctx.createLinearGradient(x, y, x+tw-gw*2, y+tw-gw*2);
      g.addColorStop(0, 'rgba(255,255,255,0.07)');
      g.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.05)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, tw-gw*2, tw-gw*2);
    }
  }
  return c;
}

function generatePaversAlbedo(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rng = seededRandom(123);

  const rows = 16, cols = 10;
  const ph = size / rows, pw = size / cols, jw = 3;
  const colors = ['#a8a29e','#9e9894','#b0aaa6','#a39d99'];

  ctx.fillStyle = '#383330';
  ctx.fillRect(0, 0, size, size);

  for (let r = 0; r < rows; r++) {
    const ox = (r % 2) * pw * 0.5;
    for (let col = -1; col < cols + 1; col++) {
      const x = col * pw + ox - pw*0.5 + jw;
      const y = r * ph + jw;
      if (x + pw - jw < 0 || x > size) continue;
      const ci = colors[Math.floor(rng() * colors.length)];
      ctx.fillStyle = ci;
      ctx.fillRect(x, y, pw - jw*2, ph - jw*2);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(x, y, 2, ph - jw*2);
      ctx.fillRect(x + pw - jw*2 - 2, y, 2, ph - jw*2);
    }
  }
  return c;
}

function generateTravertineAlbedo(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rng = seededRandom(456);

  ctx.fillStyle = '#eaded0';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 600; i++) {
    const x = rng() * size, y = rng() * size;
    ctx.fillStyle = `rgba(235,225,215,0.2)`;
    ctx.beginPath(); ctx.arc(x, y, 8 + rng()*28, 0, Math.PI*2); ctx.fill();
  }

  ctx.strokeStyle = 'rgba(210,195,180,0.45)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    let cx = rng() * size, cy = rng() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 14; j++) {
      cx += (rng()-0.5) * 160;
      cy += (rng()-0.5) * 110;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(220,205,190,0.3)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 25; i++) {
    ctx.beginPath();
    let cx = rng() * size, cy = rng() * size;
    ctx.moveTo(cx, cy);
    for (let j = 0; j < 8; j++) {
      cx += (rng()-0.5) * 90;
      cy += (rng()-0.5) * 70;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(185,170,155,0.55)';
  for (let i = 0; i < 100; i++) {
    const x = rng() * size, y = rng() * size;
    const rx = 3 + rng() * 12, ry = rx * (0.5 + rng() * 0.5);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rng() * Math.PI * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function generateNormalMap(albedoCanvas, strength = 0.5) {
  const c = document.createElement('canvas');
  c.width = albedoCanvas.width;
  c.height = albedoCanvas.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(albedoCanvas, 0, 0);

  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data, w = c.width, h = c.height;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = (d[i*4] + d[i*4+1] + d[i*4+2]) / 765;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const dx = (gray[i+1] - gray[i-1]) * strength * 6;
      const dy = (gray[i+w] - gray[i-w]) * strength * 6;
      const nz = 1 / Math.sqrt(dx*dx + dy*dy + 1);
      d[i*4] = Math.round((dx * nz * 0.5 + 0.5) * 255);
      d[i*4+1] = Math.round((dy * nz * 0.5 + 0.5) * 255);
      d[i*4+2] = Math.round((nz * 0.5 + 0.5) * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function generateRoughnessMap(size, baseRoughness, variance = 0.1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rng = seededRandom(999);

  const v = Math.round(baseRoughness * 255);
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 350; i++) {
    const x = rng() * size, y = rng() * size;
    const rv = baseRoughness + (rng() - 0.5) * variance * 2;
    const cv = Math.round(Math.max(0, Math.min(1, rv)) * 255);
    ctx.fillStyle = `rgba(${cv},${cv},${cv},0.35)`;
    ctx.beginPath(); ctx.arc(x, y, 5 + rng()*22, 0, Math.PI*2); ctx.fill();
  }
  return c;
}

const textureCache = {};

export function getMaterial(option, texSize = 512) {
  const key = `${option.textureType}_${texSize}`;
  if (textureCache[key]) return textureCache[key].clone();

  let albedoCanvas;
  switch (option.textureType) {
    case 'plaster': albedoCanvas = generatePlasterAlbedo(texSize); break;
    case 'mosaic': albedoCanvas = generateMosaicAlbedo(texSize); break;
    case 'pavers': albedoCanvas = generatePaversAlbedo(texSize); break;
    case 'travertine': albedoCanvas = generateTravertineAlbedo(texSize); break;
    default: albedoCanvas = generatePlasterAlbedo(texSize);
  }

  const normalCanvas = generateNormalMap(albedoCanvas, 0.5);
  const roughCanvas = generateRoughnessMap(texSize, option.roughness, 0.12);

  const mapTex = new THREE.CanvasTexture(albedoCanvas);
  const normalTex = new THREE.CanvasTexture(normalCanvas);
  const roughTex = new THREE.CanvasTexture(roughCanvas);

  [mapTex, normalTex, roughTex].forEach((tex, i) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = i === 0 ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
  });

  const rpt = option.repeat || [1, 1];
  mapTex.repeat.set(rpt[0], rpt[1]);
  normalTex.repeat.set(rpt[0], rpt[1]);
  roughTex.repeat.set(rpt[0], rpt[1]);

  const mat = new THREE.MeshStandardMaterial({
    map: mapTex,
    normalMap: normalTex,
    roughnessMap: roughTex,
    roughness: option.roughness,
    metalness: option.metalness || 0,
    color: new THREE.Color(option.color),
  });

  textureCache[key] = mat;
  return mat;
}

export function clearTextureCache() {
  Object.values(textureCache).forEach(m => {
    m.map?.dispose();
    m.normalMap?.dispose();
    m.roughnessMap?.dispose();
    m.dispose();
  });
  Object.keys(textureCache).forEach(k => delete textureCache[k]);
}
