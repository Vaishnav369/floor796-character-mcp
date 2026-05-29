import { gunzipSync } from "node:zlib";

const ILLEGAL_CODES = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127, 152,
]);

const alphaCp1251 = Array.from({ length: 256 }, (_, i) => i).filter(
  (code) => !ILLEGAL_CODES.has(code),
);
const decoder = new TextDecoder("windows-1251");
const alphabet = decoder.decode(new Uint8Array(alphaCp1251));
const alphaInv32: number[] = new Array(9000);
const alphaInv64: bigint[] = new Array(9000);

for (let i = 0; i < alphabet.length; i += 1) {
  const code = alphabet.charCodeAt(i);
  alphaInv32[code] = i;
  alphaInv64[code] = BigInt(i);
}

export function decodeBase223(data: string): Uint8Array {
  const len = data.length;
  if ((len - 1) % 5 !== 0) {
    throw new Error(`base223: invalid data length ${len}`);
  }

  const out: number[] = [];
  const buffer: bigint[] = new Array(39);
  let bufferIdx = 0;
  const lastSegIdx = len - 1 - 5;

  for (let i = 0; i < len - 1; i += 5) {
    const num =
      alphaInv64[data.charCodeAt(i)] * 2472973441n +
      BigInt(
        alphaInv32[data.charCodeAt(i + 1)] * 11089567 +
          alphaInv32[data.charCodeAt(i + 2)] * 49729 +
          alphaInv32[data.charCodeAt(i + 3)] * 223 +
          alphaInv32[data.charCodeAt(i + 4)],
      );

    if (num !== num) {
      throw new Error(`base223: unknown char in data segment i=${i}`);
    }

    if (bufferIdx === 39 || i === lastSegIdx) {
      for (let j = 0, l = bufferIdx; j < l; j += 1) {
        let num2 = buffer[j];
        num2 <<= 1n;
        num2 |= (num >> BigInt(38 - j)) & 1n;
        const num3 = Number(num2 & 0xffffffffn);

        out.push(
          Number((num2 >> 32n) & 0xffn),
          (num3 >> 24) & 0xff,
          (num3 >> 16) & 0xff,
          (num3 >> 8) & 0xff,
          num3 & 0xff,
        );
      }
      bufferIdx = 0;
    } else {
      buffer[bufferIdx] = num;
      bufferIdx += 1;
    }
  }

  const paddingChars = alphaInv32[data.charCodeAt(len - 1)];
  if (paddingChars === undefined) {
    throw new Error("base223: unknown char code for padding length");
  }
  if (paddingChars > 0) {
    out.splice(-paddingChars);
  }

  return new Uint8Array(out);
}

export function decodeEmbeddedAsset(data: string, compression: string): Buffer {
  const decoded = Buffer.from(decodeBase223(data));
  if (compression === "gzip") {
    return gunzipSync(decoded);
  }
  if (compression === "none") {
    return decoded;
  }
  throw new Error(`Unsupported compression: ${compression}`);
}
