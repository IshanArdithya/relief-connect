import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '@nx-mono-repo-deployment-test/shared/src/interfaces/user/IUser';

/**
 * JWT utility for token generation and verification
 */
class JwtUtil {
  private static readonly SECRET_KEY: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static readonly ACCESS_TOKEN_EXPIRES_IN: string = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN: string = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';
  private static readonly REFRESH_TOKEN_SECRET: string = process.env.JWT_REFRESH_SECRET || (JwtUtil.SECRET_KEY + '-refresh');

  /**
   * Generate access token for user (short-lived)
   * @param user - User object (password will be excluded)
   * @returns JWT access token string
   */
  public static generateAccessToken(user: IUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      type: 'access',
    };

    const options: SignOptions = {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    };

    return jwt.sign(payload, this.SECRET_KEY, options);
  }

  /**
   * Generate refresh token for user (long-lived)
   * @param user - User object (password will be excluded)
   * @returns JWT refresh token string
   */
  public static generateRefreshToken(user: IUser): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
    };

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
  }

  /**
   * Verify access token
   * @param token - JWT access token string
   * @returns Decoded token payload or null if invalid
   */
  public static verifyAccessToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.SECRET_KEY) as any;
      if (decoded.type !== 'access') {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token string
   * @returns Decoded token payload or null if invalid
   */
  public static verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param token - JWT token string
   * @returns Decoded token payload or null
   */
  public static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

export default JwtUtil;

