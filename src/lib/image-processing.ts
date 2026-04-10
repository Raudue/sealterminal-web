import sharp from 'sharp';

/**
 * Remove green screen (#00FF00) background from an image buffer.
 * Sets alpha=0 for pixels where green dominates red and blue.
 * Applies edge smoothing to prevent green fringing.
 */
export async function removeGreenScreen(inputBuffer: Buffer): Promise<Buffer> {
  const image = sharp(inputBuffer).removeAlpha().ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const { width, height, channels } = info;

  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];

    // Detect green-screen pixels: green channel significantly higher than red and blue
    const isGreen = g > 100 && g > r * 1.4 && g > b * 1.4;

    if (isGreen) {
      pixels[offset + 3] = 0; // fully transparent
      // Zero out color to prevent green bleed in semi-transparent areas
      pixels[offset] = 0;
      pixels[offset + 1] = 0;
      pixels[offset + 2] = 0;
    }
  }

  // Edge smoothing pass: reduce green fringe on semi-transparent edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const alpha = pixels[idx + 3];

      // Only process opaque edge pixels
      if (alpha > 0) {
        // Check if any neighbor is transparent
        const neighbors = [
          ((y - 1) * width + x) * channels,
          ((y + 1) * width + x) * channels,
          (y * width + (x - 1)) * channels,
          (y * width + (x + 1)) * channels,
        ];

        let hasTransparentNeighbor = false;
        for (const ni of neighbors) {
          if (pixels[ni + 3] === 0) {
            hasTransparentNeighbor = true;
            break;
          }
        }

        if (hasTransparentNeighbor) {
          // Desaturate green from edge pixels
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          if (g > r && g > b) {
            const avg = Math.round((r + b) / 2);
            pixels[idx + 1] = Math.min(g, Math.max(avg, Math.round(g * 0.7)));
          }
        }
      }
    }
  }

  return sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();
}

/**
 * Resize image to target dimensions with pixelated scaling.
 */
export async function resizeImage(
  buffer: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
}
