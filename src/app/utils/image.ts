const PINATA_GATEWAY_HOST = 'pink-quick-lizard-297.mypinata.cloud';

export function optimizedImageUrl(src: string, width: number, quality = 80) {
  try {
    const url = new URL(src);
    if (url.hostname !== PINATA_GATEWAY_HOST) return src;

    url.searchParams.set('img-width', String(width));
    url.searchParams.set('img-quality', String(quality));
    url.searchParams.set('img-format', 'webp');
    return url.toString();
  } catch {
    return src;
  }
}

export function optimizedImageSrcSet(src: string, widths: number[], quality = 80) {
  return widths
    .map(width => `${optimizedImageUrl(src, width, quality)} ${width}w`)
    .join(', ');
}
