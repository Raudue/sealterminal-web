import sharp from 'sharp';

/**
 * Remove green-ish background from an image buffer.
 * Uses multiple detection strategies to catch various shades of green
 * that Gemini generates (not just pure #00FF00).
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

    // Strategy 1: Pure green screen (#00FF00 and close variants)
    const isPureGreen = g > 180 && r < 100 && b < 100;

    // Strategy 2: Green-dominant pixels (green channel much higher than others)
    const isGreenDominant = g > 80 && g > r * 1.2 && g > b * 1.2;

    // Strategy 3: Bright green-ish (catches yellow-green, lime, etc)
    const isBrightGreen = g > 150 && g > r * 1.1 && g > b * 1.3;

    // Strategy 4: HSL-based - pixel is in green hue range
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const isGreenHue = g === max && g > 60 && saturation > 0.3 && r < 200 && b < 200;

    if (isPureGreen || isGreenDominant || isBrightGreen || isGreenHue) {
      pixels[offset + 3] = 0;
      pixels[offset] = 0;
      pixels[offset + 1] = 0;
      pixels[offset + 2] = 0;
    }
  }

  // Edge smoothing pass: reduce green fringe on edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const alpha = pixels[idx + 3];

      if (alpha > 0) {
        const neighbors = [
          ((y - 1) * width + x) * channels,
          ((y + 1) * width + x) * channels,
          (y * width + (x - 1)) * channels,
          (y * width + (x + 1)) * channels,
        ];

        let transparentCount = 0;
        for (const ni of neighbors) {
          if (pixels[ni + 3] === 0) transparentCount++;
        }

        // If most neighbors are transparent, this is likely a stray edge pixel
        if (transparentCount >= 3) {
          pixels[idx + 3] = 0;
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
        } else if (transparentCount >= 1) {
          // Desaturate green from edge pixels
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          if (g > r && g > b) {
            const avg = Math.round((r + b) / 2);
            pixels[idx + 1] = Math.min(g, Math.max(avg, Math.round(g * 0.6)));
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
