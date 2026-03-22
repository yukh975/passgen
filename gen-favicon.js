#!/usr/bin/env node
// Generates favicon.ico (16, 32, 48 px) with lock icon matching the SVG logo.
// No dependencies — uses only Node.js built-in zlib.
// Run: node gen-favicon.js

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

const BG     = [0x0d, 0x11, 0x17, 0xff];
const ACCENT = [0x58, 0xa6, 0xff, 0xff];
const TRANS  = [0x00, 0x00, 0x00, 0x00];

// ── Pixel canvas ────────────────────────────────────────────

function createPixels(size) {
    const s  = size / 32;
    const px = Array.from({ length: size * size }, () => [...BG]);

    function set(x, y, c) {
        if (x >= 0 && x < size && y >= 0 && y < size)
            px[Math.round(y) * size + Math.round(x)] = [...c];
    }

    // Rounded corners (transparent)
    const cr = Math.max(2, Math.round(3 * s));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let outside = false;
            const corners = [
                [cr - 1, cr - 1],
                [size - cr, cr - 1],
                [cr - 1, size - cr],
                [size - cr, size - cr],
            ];
            for (const [cx, cy] of corners) {
                if (x <= cx + cr - 1 && x >= cx - cr + 1 &&
                    y <= cy + cr - 1 && y >= cy - cr + 1) {
                    const dx = x - cx, dy = y - cy;
                    if (dx * dx + dy * dy > (cr - 0.5) * (cr - 0.5)) {
                        outside = true; break;
                    }
                }
            }
            if (outside) px[y * size + x] = [...TRANS];
        }
    }

    function p(v)  { return v * s; }         // scale coord
    function rp(v) { return Math.round(p(v)); }

    function fillRect(x1, y1, x2, y2, color) {
        for (let y = rp(y1); y <= rp(y2); y++)
            for (let x = rp(x1); x <= rp(x2); x++)
                set(x, y, color);
    }

    function fillCircle(cx, cy, r, color) {
        const cxs = p(cx), cys = p(cy), rs = p(r);
        for (let y = Math.round(cys - rs); y <= Math.round(cys + rs); y++)
            for (let x = Math.round(cxs - rs); x <= Math.round(cxs + rs); x++)
                if ((x - cxs) ** 2 + (y - cys) ** 2 <= rs * rs)
                    set(x, y, color);
    }

    // Shackle arc (top half of donut)
    const shCx = 16, shCy = 13, shOr = 7, shIr = 4.5;
    const shCxs = p(shCx), shCys = p(shCy);
    const or2 = p(shOr) ** 2, ir2 = p(shIr) ** 2;
    for (let y = 0; y <= Math.round(shCys); y++) {
        for (let x = Math.round(shCxs - p(shOr)); x <= Math.round(shCxs + p(shOr)); x++) {
            const dx = x - shCxs, dy = y - shCys;
            const d2 = dx * dx + dy * dy;
            if (d2 <= or2 && d2 >= ir2) set(x, y, ACCENT);
        }
    }

    // Shackle legs (vertical, connecting arc to body)
    fillRect(shCx - shOr,     shCy, shCx - shIr - 1, 21, ACCENT);
    fillRect(shCx + shIr + 1, shCy, shCx + shOr,     21, ACCENT);

    // Lock body outer
    fillRect(8, 20, 24, 29, ACCENT);

    // Lock body inner (dark cutout)
    fillRect(10.5, 22, 21.5, 28, BG);

    // Keyhole circle
    fillCircle(16, 23.5, 2, ACCENT);

    // Keyhole stem
    fillRect(15, 25, 17, 27.5, ACCENT);

    return px;
}

// ── PNG encoder ─────────────────────────────────────────────

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const b of buf) {
        crc ^= b;
        for (let k = 0; k < 8; k++)
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
    const len  = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const tb   = Buffer.from(type);
    const crcB = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([tb, data])));
    return Buffer.concat([len, tb, data, crcB]);
}

function encodePNG(pixels, size) {
    const raw = Buffer.alloc(size * (1 + size * 4));
    for (let y = 0; y < size; y++) {
        const off = y * (1 + size * 4);
        raw[off] = 0; // filter: none
        for (let x = 0; x < size; x++) {
            const c = pixels[y * size + x];
            raw[off + 1 + x * 4 + 0] = c[0];
            raw[off + 1 + x * 4 + 1] = c[1];
            raw[off + 1 + x * 4 + 2] = c[2];
            raw[off + 1 + x * 4 + 3] = c[3];
        }
    }

    const idat = zlib.deflateSync(raw, { level: 9 });

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        pngChunk('IHDR', ihdr),
        pngChunk('IDAT', idat),
        pngChunk('IEND', Buffer.alloc(0)),
    ]);
}

// ── ICO builder ──────────────────────────────────────────────

function buildICO(entries) {
    const count      = entries.length;
    const headerSize = 6 + count * 16;
    let   offset     = headerSize;

    const offsets = entries.map(e => { const o = offset; offset += e.data.length; return o; });

    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2); // ICO
    header.writeUInt16LE(count, 4);

    const dirs = entries.map(({ size, data }, i) => {
        const e = Buffer.alloc(16);
        e[0] = size === 256 ? 0 : size;
        e[1] = size === 256 ? 0 : size;
        e[2] = 0; e[3] = 0;
        e.writeUInt16LE(1, 4);
        e.writeUInt16LE(32, 6);
        e.writeUInt32LE(data.length, 8);
        e.writeUInt32LE(offsets[i], 12);
        return e;
    });

    return Buffer.concat([header, ...dirs, ...entries.map(e => e.data)]);
}

// ── Main ─────────────────────────────────────────────────────

const sizes   = [16, 32, 48];
const entries = sizes.map(size => ({ size, data: encodePNG(createPixels(size), size) }));
const ico     = buildICO(entries);

const out = path.join(__dirname, 'favicon.ico');
fs.writeFileSync(out, ico);
console.log(`favicon.ico written — ${ico.length} bytes (${sizes.join(', ')} px)`);
