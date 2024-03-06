import jwt from "jsonwebtoken";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../config/environment.js";

class TokenService {
  async generateToken(payload) {
    const refresh_token = jwt.sign(payload, REFRESH_TOKEN, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const access_token = jwt.sign(payload, ACCESS_TOKEN, {
      expiresIn: 60 * 60 * 24 * 7,
    });

    return { access_token, refresh_token };
  }

  async verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN);
  }

  async verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN);
  }
}

export const tokenService = new TokenService();
