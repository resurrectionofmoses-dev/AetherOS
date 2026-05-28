import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TOTPSecret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
}

export class TwoFactorService {
    static generateSecret(email: string): TOTPSecret {
        return speakeasy.generateSecret({
            name: `AetherOS (${email})`,
        });
    }

    static async generateQRCode(otpauthUrl: string): Promise<string> {
        return QRCode.toDataURL(otpauthUrl);
    }

    static verifyToken(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1 // 30 second window
        });
    }
}
