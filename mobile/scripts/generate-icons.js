/* eslint-disable */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS = path.join(__dirname, '..', 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

const PROMPT =
  'lotus flower emerald green #10B981 sacred geometry minimalist 3d glow rich black background #0a0a0f no text mobile app icon centered symmetric';

function pollinationsURL(width, height) {
  const enc = encodeURIComponent(PROMPT);
  return `https://image.pollinations.ai/prompt/${enc}?width=${width}&height=${height}&model=flux&enhance=true&nologo=true&seed=42`;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) =>
      https
        .get(u, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return get(res.headers.location);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          res.pipe(file);
          file.on('finish', () => file.close(() => resolve(dest)));
        })
        .on('error', reject);
    get(url);
  });
}

async function fallbackSVG(size, withText) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
        <stop offset="60%" stop-color="#0a0a0f"/>
        <stop offset="100%" stop-color="#0a0a0f"/>
      </radialGradient>
      <linearGradient id="petal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#a7f3d0"/>
        <stop offset="60%" stop-color="#34d399"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="#0a0a0f"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="url(#bg)"/>
    <g transform="translate(${size / 2},${size / 2})">
      ${[0, 60, 120, 180, 240, 300]
        .map(
          (angle) =>
            `<ellipse cx="0" cy="-${size * 0.18}" rx="${size * 0.09}" ry="${size * 0.22}" fill="url(#petal)" opacity="0.85" transform="rotate(${angle})"/>`
        )
        .join('')}
      <circle r="${size * 0.07}" fill="#ecfdf5"/>
    </g>
    ${
      withText
        ? `<text x="50%" y="${size * 0.92}" font-family="system-ui,sans-serif" font-size="${size * 0.08}" font-weight="700" fill="#a7f3d0" text-anchor="middle">VIDA</text>`
        : ''
    }
  </svg>`;
  return Buffer.from(svg);
}

async function generate() {
  console.log('Generating Vida Langue icons (lotus emerald)…');

  // Try Pollinations first (square 1024)
  let basePng;
  try {
    const tmp = path.join(ASSETS, '_base.png');
    await download(pollinationsURL(1024, 1024), tmp);
    basePng = tmp;
    console.log('Pollinations base downloaded.');
  } catch (e) {
    console.warn('Pollinations failed, using SVG fallback:', e.message);
    basePng = null;
  }

  const baseInput = basePng
    ? sharp(basePng)
    : sharp(await fallbackSVG(1024, false));

  // icon.png 1024x1024
  await baseInput
    .clone()
    .resize(1024, 1024, { fit: 'cover' })
    .png()
    .toFile(path.join(ASSETS, 'icon.png'));

  // adaptive-icon.png 1024x1024 with 100px transparent padding ring
  const adaptive = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 10, g: 10, b: 15, alpha: 1 },
    },
  });
  const inner = await baseInput
    .clone()
    .resize(824, 824, { fit: 'cover' })
    .png()
    .toBuffer();
  await adaptive
    .composite([{ input: inner, top: 100, left: 100 }])
    .png()
    .toFile(path.join(ASSETS, 'adaptive-icon.png'));

  // splash-icon.png centered emblem on rich black, ~600px symbol
  await sharp({
    create: {
      width: 1284,
      height: 2778,
      channels: 4,
      background: { r: 10, g: 10, b: 15, alpha: 1 },
    },
  })
    .composite([
      {
        input: await baseInput
          .clone()
          .resize(640, 640, { fit: 'cover' })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'));

  // favicon.png 48x48
  await baseInput
    .clone()
    .resize(48, 48, { fit: 'cover' })
    .png()
    .toFile(path.join(ASSETS, 'favicon.png'));

  // feature graphic 1024x500 (Play Store)
  await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 4,
      background: { r: 10, g: 10, b: 15, alpha: 1 },
    },
  })
    .composite([
      {
        input: await baseInput
          .clone()
          .resize(420, 420, { fit: 'cover' })
          .png()
          .toBuffer(),
        top: 40,
        left: 60,
      },
    ])
    .png()
    .toFile(path.join(ASSETS, 'feature-graphic.png'));

  if (basePng) fs.unlinkSync(basePng);
  console.log('Icons generated in', ASSETS);
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
