import crypto from 'crypto';

interface EncryptedResponse {
    ephemPublicKey: string;
    iv: string;
    data: string;
}

export async function decryptResponse(encrypted: EncryptedResponse): Promise<any> {
    const privateKeyPem = process.env.API_PRIVATE_KEY;
    if (!privateKeyPem) {
        throw new Error('API_PRIVATE_KEY is not defined');
    }

    try {
        // 1. Load Static Private Key
        const staticPrivateKey = crypto.createPrivateKey(privateKeyPem);

        // 2. Load Ephemeral Public Key
        // The backend sends a PKIX encoded public key (SubjectPublicKeyInfo)
        const ephemPublicKeyBuffer = Buffer.from(encrypted.ephemPublicKey, 'base64');
        const ephemPublicKey = crypto.createPublicKey({
            key: ephemPublicKeyBuffer,
            format: 'der',
            type: 'spki'
        });

        // 3. Perform ECDH to derive shared secret
        const sharedSecret = crypto.diffieHellman({
            privateKey: staticPrivateKey,
            publicKey: ephemPublicKey,
        });

        // 4. Derive AES Key using HKDF (SHA-256)
        // Salt is the ephemeral public key (as bytes)
        // Info is "status-monitor"
        const aesKey = await new Promise<Buffer>((resolve, reject) => {
            crypto.hkdf(
                'sha256',
                sharedSecret,
                ephemPublicKeyBuffer, // salt
                Buffer.from('status-monitor'), // info
                32, // length
                (err, derivedKey) => {
                    if (err) reject(err);
                    else resolve(Buffer.from(derivedKey));
                }
            );
        });

        // 5. Decrypt Data with AES-GCM
        const iv = Buffer.from(encrypted.iv, 'base64');
        const encryptedData = Buffer.from(encrypted.data, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);

        const authTagLength = 16;
        const authTag = encryptedData.subarray(encryptedData.length - authTagLength);
        const dataWithoutTag = encryptedData.subarray(0, encryptedData.length - authTagLength);

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(dataWithoutTag);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt response');
    }
}
