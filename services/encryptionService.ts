
/**
 * THE SHROUD ENGINE: CRYPTOGRAPHIC SOVEREIGNTY
 * Protocol: 0x03E2_SHROUD
 * Ensures all logic shards are unreadable to external observers.
 */

export class EncryptionService {
  private key: CryptoKey | null = null;
  private salt = new Uint8Array([142, 3, 226, 88, 12, 99, 21, 42, 101, 204, 33, 9, 7, 0, 1, 4]); // 0x03E2 fixed salt

  /**
   * Derives a master key from the Conductor's passphrase.
   */
  public async initialize(passphrase: string): Promise<void> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    this.key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    console.log("[SHROUD] Master Shard Synchronized.");
  }

  public async encrypt(text: string): Promise<string> {
    if (!this.key) return text;
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this.key,
      enc.encode(text)
    );

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  public async decrypt(encoded: string): Promise<string> {
    if (!this.key) return encoded;
    try {
      const combined = new Uint8Array(atob(encoded).split("").map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);
      const dec = new TextDecoder();
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        this.key,
        ciphertext
      );
      return dec.decode(decrypted);
    } catch (e) {
      return "[DECRYPTION_FAILURE: INVALID_SHARD]";
    }
  }

  public get isLocked(): boolean {
    return this.key === null;
  }
}

export const shroud = new EncryptionService();
