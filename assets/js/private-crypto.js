const iterations = 600000;
const maximumBytes = 32 * 1024 * 1024;
const maximumCiphertext = 45000000;

function toBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }
  return btoa(binary);
}

function fromBase64(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("保護データの形式が不正です。");
  }
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function deriveKey(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("HTTPSまたはlocalhostで開いてください。");
  }
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptDocument(html, password) {
  if ([...password].length < 8) {
    throw new Error(
      "8文字以上のパスワードを設定してください。20文字以上を推奨します。",
    );
  }
  const plaintext = new TextEncoder().encode(html);
  if (!plaintext.length || plaintext.length > maximumBytes) {
    throw new Error("資料全体を空でない32MiB以下にしてください。");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const compressed = await new Response(
    new Blob([plaintext]).stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    compressed,
  );
  return {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations,
    compression: "gzip",
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptDocument(payload, password) {
  if (
    !payload ||
    payload.version !== 1 ||
    payload.algorithm !== "AES-256-GCM" ||
    payload.kdf !== "PBKDF2-SHA256" ||
    payload.iterations !== iterations ||
    typeof payload.ciphertext !== "string" ||
    payload.ciphertext.length > maximumCiphertext ||
    (payload.compression !== undefined && payload.compression !== "gzip")
  ) {
    throw new Error("保護データの形式が不正です。");
  }
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.ciphertext);
  if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 17) {
    throw new Error("保護データの形式が不正です。");
  }
  const key = await deriveKey(password, salt);
  const decoded = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  let plaintext = decoded;
  if (payload.compression === "gzip") {
    const reader = new Blob([decoded])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"))
      .getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maximumBytes) {
        await reader.cancel();
        throw new Error("資料全体が32MiBを超えています。");
      }
      chunks.push(result.value);
    }
    plaintext = await new Blob(chunks).arrayBuffer();
  }
  if (plaintext.byteLength > maximumBytes)
    throw new Error("資料全体が32MiBを超えています。");
  return new TextDecoder("utf-8", { fatal: true }).decode(plaintext);
}
