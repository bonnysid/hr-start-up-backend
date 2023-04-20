"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const AdminController_1 = __importDefault(require("../controllers/AdminController"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const RoleMiddleware_1 = require("../middleware/RoleMiddleware");
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.check)('email', 'Имя пользователя не может быть пустым').notEmpty(),
    (0, express_validator_1.check)('password', 'Пароль не может быть пустым').notEmpty(),
], AdminController_1.default.login);
router.get('/roles', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), AdminController_1.default.getRoles);
router.post('/create/user', AuthMiddleware_1.authMiddleware, (0, RoleMiddleware_1.roleMiddleware)(['ADMIN']), AdminController_1.default.createUser);
router.post('/refresh', AdminController_1.default.refreshToken);
router.post('/check', AdminController_1.default.checkToken);
exports.default = router;
