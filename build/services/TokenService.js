"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
class TokenService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.secret, { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.refreshSecret, { expiresIn: '30d' });
        return {
            accessToken,
            refreshToken,
        };
    }
}
exports.default = new TokenService();
