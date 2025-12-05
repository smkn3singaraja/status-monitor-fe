export interface EncryptedResponse {
    ephemPublicKey: string;
    iv: string;
    data: string;
}

const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VuBCIEIKh3f6SloHjgEvF0kIi5ckvtXOkRATCgBhV7hGJGmPd7
-----END PRIVATE KEY-----`;

function str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
    // Remove header, footer, and newlines
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pem.substring(
        pem.indexOf(pemHeader) + pemHeader.length,
        pem.indexOf(pemFooter)
    ).replace(/\s/g, "");

    const binaryDer = base64ToArrayBuffer(pemContents);

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "X25519",
        },
        false,
        ["deriveBits"]
    );
}

async function importPublicKey(base64Key: string): Promise<CryptoKey> {
    const binaryDer = base64ToArrayBuffer(base64Key);

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "X25519",
        },
        false,
        []
    );
}

export async function decryptResponseClient(encrypted: EncryptedResponse): Promise<any> {
    try {
        // 1. Import Keys
        const privateKey = await importPrivateKey(PRIVATE_KEY_PEM);
        const publicKey = await importPublicKey(encrypted.ephemPublicKey);

        // 2. Derive Shared Secret (ECDH)
        const sharedSecret = await window.crypto.subtle.deriveBits(
            {
                name: "X25519",
                public: publicKey,
            },
            privateKey,
            256
        );

        // 3. Derive AES Key (HKDF)
        // We need to import the shared secret as a key for HKDF
        const hkdfKey = await window.crypto.subtle.importKey(
            "raw",
            sharedSecret,
            { name: "HKDF" },
            false,
            ["deriveKey"]
        );

        const salt = base64ToArrayBuffer(encrypted.ephemPublicKey);
        const info = new TextEncoder().encode("status-monitor");

        const aesKey = await window.crypto.subtle.deriveKey(
            {
                name: "HKDF",
                hash: "SHA-256",
                salt: salt,
                info: info,
            },
            hkdfKey,
            {
                name: "AES-GCM",
                length: 256,
            },
            false,
            ["decrypt"]
        );

        // 4. Decrypt Data (AES-GCM)
        const iv = base64ToArrayBuffer(encrypted.iv);
        const encryptedData = base64ToArrayBuffer(encrypted.data);

        // In Node.js crypto, authTag is separate. In Web Crypto, it's appended to the ciphertext.
        // The backend seems to use standard AES-GCM where tag is usually appended or handled.
        // Let's check the Node.js implementation in crypto.ts:
        // const authTag = encryptedData.subarray(encryptedData.length - authTagLength);
        // const dataWithoutTag = encryptedData.subarray(0, encryptedData.length - authTagLength);
        // decipher.setAuthTag(authTag);
        // So the 'encrypted.data' from backend INCLUDES the auth tag at the end?
        // If so, Web Crypto expects exactly that (ciphertext + tag).
        // Wait, Node.js `crypto.createDecipheriv` usually expects ciphertext and you set auth tag separately.
        // But `crypto.ts` does: `const encryptedData = Buffer.from(encrypted.data, 'base64');`
        // Then it splits it. So `encrypted.data` contains BOTH.
        // Web Crypto `decrypt` expects the ciphertext to include the tag at the end.
        // So we can pass `encryptedData` directly.

        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            aesKey,
            encryptedData
        );

        const decryptedString = new TextDecoder().decode(decryptedBuffer);
        return JSON.parse(decryptedString);

    } catch (error) {
        console.error('Client-side decryption failed:', error);
        throw new Error('Failed to decrypt response on client');
    }
}
