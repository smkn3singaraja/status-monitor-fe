import crypto from 'crypto';

interface EncryptedResponse {
    key: string;
    iv: string;
    data: string;
}

export async function decryptResponse(encrypted: EncryptedResponse): Promise<any> {
    const privateKey = process.env.API_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('API_PRIVATE_KEY is not defined');
    }

    try {
        // 1. Decrypt AES Key with RSA Private Key
        const encryptedKey = Buffer.from(encrypted.key, 'base64');
        const aesKey = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            encryptedKey
        );

        // 2. Decrypt Data with AES-GCM
        const iv = Buffer.from(encrypted.iv, 'base64');
        const encryptedData = Buffer.from(encrypted.data, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);

        // GCM tag is appended to the end of the ciphertext in some implementations,
        // but Go's cipher.NewGCM().Seal() appends it.
        // Node's createDecipheriv expects the auth tag separately.
        // Go's Seal appends the tag to the end of the ciphertext.
        // Tag size is usually 16 bytes.
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
