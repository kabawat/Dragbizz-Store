// Simple security utilities for client-side data obfuscation.
const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY || "dragbizz_store_sync_key";

// Encrypts a string using XOR and Base64
export const encryptSync = (text) => {
    if (!text) return text;
    const strText = String(text);
    let result = "";
    for (let i = 0; i < strText.length; i++) {
        result += String.fromCharCode(
            strText.charCodeAt(i) ^ STORAGE_KEY.charCodeAt(i % STORAGE_KEY.length)
        );
    }
    return btoa(result);
};

// Decrypts a string using XOR and Base64
export const decryptSync = (encoded) => {
    if (!encoded) return encoded;
    try {
        const text = atob(encoded);
        let result = "";
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(
                text.charCodeAt(i) ^ STORAGE_KEY.charCodeAt(i % STORAGE_KEY.length)
            );
        }
        return result;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
