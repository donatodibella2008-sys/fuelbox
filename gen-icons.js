// Genera icon-192.png e icon-512.png sin dependencias externas
// Usa Canvas API de Node 18+ (no disponible) → genera PNG mínimo válido con puro Buffer

const fs = require('fs');
const path = require('path');

function createPNG(size) {
  // PNG header + IHDR + IDAT (solid #E8431A square) + IEND
  // Usamos la librería canvas si existe, sino escribimos SVG como fallback
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#0F0F0F"/>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#E8431A" opacity="0.15"/>
  <text x="50%" y="44%" font-family="Arial Black, sans-serif" font-weight="900" font-size="${size * 0.38}" fill="#E8431A" text-anchor="middle" dominant-baseline="middle">F</text>
  <text x="50%" y="72%" font-family="Arial, sans-serif" font-size="${size * 0.12}" fill="#F7A325" text-anchor="middle" font-weight="700" letter-spacing="${size * 0.02}">FUELBOX</text>
</svg>`;
  return svgContent;
}

const outDir = path.join(__dirname, 'public');

// Guardar como SVG con extension .png (funciona para PWA en la mayoria de browsers modernos)
// Para PNG real se necesita canvas o sharp
[192, 512].forEach(size => {
  const svg = createPNG(size);
  // Intentar usar sharp si existe
  try {
    const sharp = require('sharp');
    sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`), err => {
        if (err) console.error(`Error ${size}:`, err);
        else console.log(`icon-${size}.png generado con sharp`);
      });
  } catch {
    // Fallback: guardar SVG directo (renombrado a .png, funciona en la mayoria de PWAs)
    fs.writeFileSync(path.join(outDir, `icon-${size}.svg`), svg);
    // Crear PNG mínimo válido de 1x1 como placeholder
    fs.writeFileSync(path.join(outDir, `icon-${size}.png`), Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    ));
    console.log(`icon-${size}.png placeholder + icon-${size}.svg real guardado`);
  }
});
