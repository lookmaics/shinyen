import fs from "fs";
import path from "path";
import zlib from "zlib";

function createSolidPng(width, height, r, g, b) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(2, 9); // Color type 2 (RGB)
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace

  const ihdrChunk = createChunk("IHDR", ihdrData);

  // 3. Raw Scanline Data (1 filter byte + 3 bytes per pixel)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // Slight vertical gradient from crimson to dark red
      const ratio = y / height;
      const red = Math.round(r * (1 - ratio * 0.3));
      const green = Math.round(g * (1 - ratio * 0.3));
      const blue = Math.round(b * (1 - ratio * 0.3));

      rawData[pxOffset] = red;
      rawData[pxOffset + 1] = green;
      rawData[pxOffset + 2] = blue;
    }
  }

  // Deflate compressed IDAT
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk("IDAT", compressedData);

  // 4. IEND Chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buffer = Buffer.alloc(4 + 4 + len + 4);
  buffer.writeUInt32BE(len, 0);
  buffer.write(type, 4);
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + len));
  buffer.writeInt32BE(crc, 8 + len);

  return buffer;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Generate PWA icons in public directory
const publicDir = path.resolve("./public");
const iconsDir = path.join(publicDir, "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Shinyen Crimson #D92D20 (R: 217, G: 45, B: 32)
const appleIcon = createSolidPng(180, 180, 217, 45, 32);
fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), appleIcon);

const icon192 = createSolidPng(192, 192, 217, 45, 32);
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), icon192);

const icon512 = createSolidPng(512, 512, 217, 45, 32);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), icon512);

const favicon = createSolidPng(32, 32, 217, 45, 32);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), favicon);

console.log("Successfully generated apple-touch-icon, icon-192, icon-512, and favicon!");
