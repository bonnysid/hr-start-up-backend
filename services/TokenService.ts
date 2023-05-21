import jwt from 'jsonwebtoken';
import { config } from '../config';
import { generateRandomCode } from './PasswordServices';

class TokenService {
  generateTokens(payload: any) {
    const accessToken = jwt.sign(payload, config.secret, { expiresIn: '24h' });
    const refreshToken = jwt.sign(payload, config.refreshSecret, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
    }
  }

  generateCodeToken() {
    const code = generateRandomCode();
    const token = jwt.sign({ code }, config.codeSecret, { expiresIn: 5 * 60 * 1000 });

    return {
      token,
      code,
    };
  }

  getCode(token: string) {
    const res = jwt.verify(token, config.codeSecret);

    return (res as any).code as string;
  }
}

export default new TokenService();
