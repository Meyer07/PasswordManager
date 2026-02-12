const totpUtils = {
    generateSecret: () => {
        const bytes = crypto.getRandomValues(new Uint8Array(20));
        return totpUtils.base32Encode(bytes);
    },

    base32Encode: (buffer) => {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let output = ''; // Fixed: was ' ' (space)

        for (let i = 0; i < buffer.length; i++) {
            value = (value << 8) | buffer[i]; // Fixed: was (value >> 8)
            bits += 8; // Fixed: was missing

            while (bits >= 5) {
                output += base32Chars[(value >>> (bits - 5)) & 31];
                bits -= 5; // Fixed: was missing
            }
        }

        if (bits > 0) {
            output += base32Chars[(value << (5 - bits)) & 31]; // Fixed: correct shift
        }

        return output;
    },

    base32Decode: (base32) => {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let index = 0;
        const output = new Uint8Array(Math.ceil(base32.length * 5 / 8));

        for (let i = 0; i < base32.length; i++) {
            const idx = base32Chars.indexOf(base32[i].toUpperCase());
            if (idx === -1) {
                continue;
            }
            value = (value << 5) | idx;
            bits += 5;

            if (bits >= 8) {
                output[index++] = (value >>> (bits - 8)) & 255; // Fixed: was | 255
                bits -= 8;
            }
        }
        return output.slice(0, index);
    },

    hmacSha1: async (key, message) => {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
        return new Uint8Array(signature);
    },

    generateTOTP: async (secret, timeStep = 30, digits = 6) => {
        try {
            const key = totpUtils.base32Decode(secret);

            const time = Math.floor(Date.now() / 1000);
            const timeCounter = Math.floor(time / timeStep);

            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setUint32(4, timeCounter, false); // Fixed: was missing!

            const hmac = await totpUtils.hmacSha1(key, new Uint8Array(buffer));

            const offset = hmac[hmac.length - 1] & 0x0f;
            const code = (
                ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff)
            );

            const otp = (code % Math.pow(10, digits)).toString().padStart(digits, '0');
            
            const timeRemaining = timeStep - (time % timeStep);

            return { code: otp, timeRemaining };
        } catch (error) {
            console.error('TOTP Generation failed:', error);
            return { code: '000000', timeRemaining: 0, error: true };
        }
    },

    generateQRCodeURL: (secret, accountName, issuer = "Password Manager") => {
        const label = encodeURIComponent(`${issuer}:${accountName}`);
        const params = new URLSearchParams({
            secret: secret,
            issuer: issuer,
            algorithm: 'SHA1',
            digits: '6',
            period: '30'
        });

        return `otpauth://totp/${label}?${params.toString()}`;
    },

    verifyTOTPCode: async (secret, code, window = 1) => {
        for (let i = -window; i <= window; i++) {
            const time = Math.floor(Date.now() / 1000) + (i * 30);
            const timeCounter = Math.floor(time / 30);

            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setUint32(4, timeCounter, false);

            const key = totpUtils.base32Decode(secret);
            const hmac = await totpUtils.hmacSha1(key, new Uint8Array(buffer));

            const offset = hmac[hmac.length - 1] & 0x0f;
            const generatedCode = (
                ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff)
            );

            const otp = (generatedCode % 1000000).toString().padStart(6, '0');

            if (otp === code) {
                return true;
            }
        }
        return false;
    }
};

export default totpUtils;