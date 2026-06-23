const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function fromBase58(string: string): Uint8Array {
  if (string.length === 0) return new Uint8Array(0);
  const bytes = [0];
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    const value = BASE58_ALPHABET.indexOf(char);
    if (value === -1) throw new Error('Non-base58 character: ' + char);
    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // Added leading zeroes
  for (let i = 0; i < string.length && string[i] === '1'; i++) {
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}

export function toBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let string = '';
  // leading zeroes
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    string += '1';
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    string += BASE58_ALPHABET[digits[i]];
  }
  return string;
}

function sha256Sync(bytes: Uint8Array): Uint8Array {
  const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const sigma0 = (x: number) => ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^ ((x >>> 22) | (x << 10));
  const sigma1 = (x: number) => ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^ ((x >>> 25) | (x << 7));
  const gamma0 = (x: number) => ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
  const gamma1 = (x: number) => ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
      h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const l = bytes.length;
  const bitLen = l * 8;
  const padLen = (l % 64 < 56) ? (56 - l % 64) : (120 - l % 64);
  const padded = new Uint8Array(l + padLen + 8);
  padded.set(bytes);
  padded[l] = 0x80;
  
  let view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen, false);

  for (let offset = 0; offset < padded.length; offset += 64) {
    const W = new Uint32Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(offset + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) | 0;
      const T2 = (sigma0(a) + maj(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) | 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const result = new Uint8Array(32);
  view = new DataView(result.buffer);
  view.setUint32(0, h0, false);
  view.setUint32(4, h1, false);
  view.setUint32(8, h2, false);
  view.setUint32(12, h3, false);
  view.setUint32(16, h4, false);
  view.setUint32(20, h5, false);
  view.setUint32(24, h6, false);
  view.setUint32(28, h7, false);
  return result;
}

function hash256(bytes: Uint8Array): Uint8Array {
  return sha256Sync(sha256Sync(bytes));
}

export interface Base58CheckResult {
  hash: Uint8Array;
  version: number;
}

export function fromBase58Check(address: string): Base58CheckResult {
  const payload = fromBase58(address);
  if (payload.length < 5) {
    throw new TypeError('Address is too short');
  }
  const version = payload[0];
  const data = payload.slice(1, payload.length - 4);
  const checksum = payload.slice(payload.length - 4);
  
  const expectedChecksum = hash256(payload.slice(0, payload.length - 4)).slice(0, 4);
  if (checksum[0] !== expectedChecksum[0] || checksum[1] !== expectedChecksum[1] ||
      checksum[2] !== expectedChecksum[2] || checksum[3] !== expectedChecksum[3]) {
    throw new TypeError('Invalid checksum');
  }
  return { hash: data, version };
}

export function toBase58Check(hash: Uint8Array, version: number): string {
  const payload = new Uint8Array(1 + hash.length + 4);
  payload[0] = version;
  payload.set(hash, 1);
  const checksum = hash256(payload.slice(0, 1 + hash.length)).slice(0, 4);
  payload.set(checksum, 1 + hash.length);
  return toBase58(payload);
}

const DEC_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polyMod(values: Uint8Array): number {
  let generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (let i = 0; i < values.length; i++) {
    let top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[i];
    for (let j = 0; j < 5; j++) {
      if ((top >> j) & 1) {
        chk ^= generator[j];
      }
    }
  }
  return chk;
}

function hrpExpand(hrp: string): Uint8Array {
  const ret = new Uint8Array(hrp.length * 2 + 1);
  for (let i = 0; i < hrp.length; i++) {
    ret[i] = hrp.charCodeAt(i) >> 5;
    ret[i + hrp.length + 1] = hrp.charCodeAt(i) & 31;
  }
  ret[hrp.length] = 0;
  return ret;
}

function createChecksum(hrp: string, data: Uint8Array, encoding: 'bech32' | 'bech32m'): Uint8Array {
  const expanded = hrpExpand(hrp);
  const combined = new Uint8Array(expanded.length + data.length + 6);
  combined.set(expanded);
  combined.set(data, expanded.length);
  const mod = polyMod(combined) ^ (encoding === 'bech32' ? 1 : 0x2bc830a3);
  const checksum = new Uint8Array(6);
  for (let i = 0; i < 6; i++) {
    checksum[i] = (mod >> (5 * (5 - i))) & 31;
  }
  return checksum;
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): Uint8Array {
  let acc = 0;
  let bits = 0;
  const result: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    if (value < 0 || value >> fromBits !== 0) {
      throw new Error('Invalid value: ' + value);
    }
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      result.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    throw new Error('Invalid padding');
  }
  return new Uint8Array(result);
}

export interface Bech32Result {
  version: number;
  prefix: string;
  data: Uint8Array;
}

export function fromBech32(address: string): Bech32Result {
  let hasLower = false;
  let hasUpper = false;
  for (let i = 0; i < address.length; i++) {
    const c = address.charCodeAt(i);
    if (c >= 97 && c <= 122) hasLower = true;
    if (c >= 65 && c <= 90) hasUpper = true;
  }
  if (hasLower && hasUpper) {
    throw new TypeError('Mixed case address');
  }
  const normalized = address.toLowerCase();
  const splitIdx = normalized.lastIndexOf('1');
  if (splitIdx === -1 || splitIdx < 1 || splitIdx + 7 > normalized.length) {
    throw new TypeError('Invalid address structure');
  }
  const prefix = normalized.slice(0, splitIdx);
  const dataPart = normalized.slice(splitIdx + 1);
  const convertedData = new Uint8Array(dataPart.length);
  for (let i = 0; i < dataPart.length; i++) {
    const charValue = DEC_ALPHABET.indexOf(dataPart[i]);
    if (charValue === -1) {
      throw new TypeError('Invalid character in address: ' + dataPart[i]);
    }
    convertedData[i] = charValue;
  }

  const expanded = hrpExpand(prefix);
  const combined = new Uint8Array(expanded.length + convertedData.length);
  combined.set(expanded);
  combined.set(convertedData, expanded.length);
  const check = polyMod(combined);
  if (check !== 1 && check !== 0x2bc830a3) {
    throw new TypeError('Invalid Bech32/Bech32m checksum');
  }
  
  const version = convertedData[0];
  if (version < 0 || version > 16) {
    throw new TypeError('Invalid witness version');
  }
  
  const rawDataBits = convertedData.slice(1, convertedData.length - 6);
  const decodedData = convertBits(rawDataBits, 5, 8, false);
  
  if (decodedData.length < 2 || decodedData.length > 40) {
    throw new TypeError('Invalid witness program size');
  }
  if (version === 0 && decodedData.length !== 20 && decodedData.length !== 32) {
    throw new TypeError('Invalid program size for witness v0');
  }
  
  return { version, prefix, data: decodedData };
}

export function toBech32(data: Uint8Array, version: number, prefix: string): string {
  const valSub = convertBits(data, 8, 5, true);
  const comb = new Uint8Array(1 + valSub.length);
  comb[0] = version;
  comb.set(valSub, 1);
  const encoding = version === 0 ? 'bech32' : 'bech32m';
  const checksum = createChecksum(prefix, comb, encoding);
  
  let result = prefix + '1';
  for (let i = 0; i < comb.length; i++) {
    result += DEC_ALPHABET[comb[i]];
  }
  for (let i = 0; i < checksum.length; i++) {
    result += DEC_ALPHABET[checksum[i]];
  }
  return result;
}

export interface Network {
  bech32: string;
  pubKeyHash: number;
  scriptHash: number;
}

export const NETWORKS: { [key: string]: Network } = {
  bitcoin: {
    bech32: 'bc',
    pubKeyHash: 0x00,
    scriptHash: 0x05,
  },
  testnet: {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
  },
  regtest: {
    bech32: 'bcrt',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
  }
};

export function toOutputScript(address: string, network: Network = NETWORKS.bitcoin): Uint8Array {
  if (address.toLowerCase().startsWith('bc1') || address.toLowerCase().startsWith('tb1') || address.toLowerCase().startsWith('bcrt1')) {
    const dec = fromBech32(address);
    if (dec.prefix !== network.bech32) {
      throw new Error(`Address prefix ${dec.prefix} does not match network limit ${network.bech32}`);
    }
    const script = new Uint8Array(2 + dec.data.length);
    script[0] = dec.version === 0 ? 0x00 : dec.version + 0x50;
    script[1] = dec.data.length;
    script.set(dec.data, 2);
    return script;
  }
  
  const dec = fromBase58Check(address);
  if (dec.version === network.pubKeyHash) {
    const script = new Uint8Array(25);
    script[0] = 0x76;
    script[1] = 0xa9;
    script[2] = 0x14;
    script.set(dec.hash, 3);
    script[23] = 0x88;
    script[24] = 0xac;
    return script;
  } else if (dec.version === network.scriptHash) {
    const script = new Uint8Array(23);
    script[0] = 0xa9;
    script[1] = 0x14;
    script.set(dec.hash, 2);
    script[22] = 0x87;
    return script;
  }
  
  throw new Error(`Invalid address version ${dec.version} or prefix for requested network`);
}

export function fromOutputScript(output: Uint8Array, network: Network = NETWORKS.bitcoin): string {
  if (output.length === 25 && output[0] === 0x76 && output[1] === 0xa9 && output[2] === 0x14 && output[23] === 0x88 && output[24] === 0xac) {
    const hash = output.slice(3, 23);
    return toBase58Check(hash, network.pubKeyHash);
  }
  if (output.length === 23 && output[0] === 0xa9 && output[1] === 0x14 && output[22] === 0x87) {
    const hash = output.slice(2, 22);
    return toBase58Check(hash, network.scriptHash);
  }
  if (output.length >= 4 && output[1] === output.length - 2) {
    const op = output[0];
    let version = -1;
    if (op === 0x00) version = 0;
    else if (op >= 0x51 && op <= 0x60) version = op - 0x50;
    
    if (version !== -1) {
      const data = output.slice(2);
      return toBech32(data, version, network.bech32);
    }
  }
  
  throw new Error('Unsupported output script template or parameters');
}
