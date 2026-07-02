const QR_SIZE = 400;
const LOGO_RATIO = 0.22;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function composeQrWithLogo(qrImageUrl, logoUrl) {
  const [qrImg, logoImg] = await Promise.all([
    loadImage(qrImageUrl),
    logoUrl ? loadImage(logoUrl).catch(() => null) : Promise.resolve(null),
  ]);

  const size = QR_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(qrImg, 0, 0, size, size);

  if (logoImg) {
    const logoSize = Math.floor(size * LOGO_RATIO);
    const padding = Math.floor(size * 0.04);
    const center = size / 2;
    const halfLogo = logoSize / 2 + padding;
    const x = center - halfLogo;
    const y = center - halfLogo;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, halfLogo * 2, halfLogo * 2);
    ctx.drawImage(logoImg, x + padding, y + padding, logoSize, logoSize);
  }

  return canvas.toDataURL("image/png");
}

export function getQrCodeServiceUrl(upiUri, size = QR_SIZE) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=H&data=${encodeURIComponent(upiUri)}`;
}

export { QR_SIZE };
