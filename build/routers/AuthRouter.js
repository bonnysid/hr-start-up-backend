"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const router = (0, express_1.Router)();
router.post('/registration', [
    (0, express_validator_1.check)('email', 'Имя пользователя не может быть пустым').notEmpty().isEmail(),
    (0, express_validator_1.check)('password', 'Пароль должен быть больше 4 и меньше 30 символов').isLength({ min: 4, max: 30 }),
], AuthController_1.default.registration);
router.post('/login', [
    (0, express_validator_1.check)('email', 'Имя пользователя не может быть пустым').notEmpty(),
    (0, express_validator_1.check)('password', 'Пароль не может быть пустым').notEmpty(),
], AuthController_1.default.login);
router.post('/refresh', AuthController_1.default.refreshToken);
router.get('/users', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), AuthController_1.default.getUsers);
exports.default = router;
