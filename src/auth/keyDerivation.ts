export async function deriveEncryptionKey(prfResult: Uint8Array): Promise<CryptoKey> {
  // Import PRF result as a raw key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    prfResult.buffer,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  // Derive an AES-GCM key
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: window.crypto.getRandomValues(new Uint8Array(32)),
      info: new TextEncoder().encode('encryption')
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return encryptionKey;
}
