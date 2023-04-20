"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = __importDefault(require("../models/Role"));
const RoleDTO_1 = __importDefault(require("../dtos/RoleDTO"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const TokenService_1 = __importDefault(require("../services/TokenService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
class AdminController {
    getRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield Role_1.default.find();
                const roleDTOS = roles.map(it => new RoleDTO_1.default(it));
                return res.json(roleDTOS);
            }
            catch (e) {
                console.log(e);
                return res.status(403).json({ message: 'Нету доступа' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ message: 'Ошибка при авторизации', errors });
                }
                const { email, password } = req.body;
                const candidate = yield User_1.default.findOne({ email });
                if (!candidate) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const validPassword = bcryptjs_1.default.compareSync(password, candidate.password);
                if (!validPassword) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                if (!candidate.roles.includes('ADMIN')) {
                    return res.status(400).json({ message: 'Введенны неверные параметры' });
                }
                const userDTO = new UserDTO_1.default(candidate);
                const tokens = TokenService_1.default.generateTokens(Object.assign({}, userDTO));
                res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Login error' });
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ message: 'Ошибка при авторизации', errors });
                }
                const { email, password, firstName, lastName, phone, roles, } = req.body;
                const candidate = yield User_1.default.findOne({ email });
                if (candidate) {
                    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
                }
                const hashPassword = bcryptjs_1.default.hashSync(password, 7);
                const rolesDB = yield Role_1.default.find();
                const user = yield User_1.default.create({
                    email,
                    password: hashPassword,
                    firstName,
                    lastName,
                    phone,
                    roles: rolesDB.filter(it => roles.includes(it.id)).map(it => it.value)
                });
                return res.json(new UserDTO_1.default(user));
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Create error' });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                const decodedData = jsonwebtoken_1.default.verify(refreshToken, config_1.config.refreshSecret);
                const newTokens = TokenService_1.default.generateTokens(decodedData);
                return res.json(newTokens);
            }
            catch (e) {
                console.log(e);
                return res.status(401).json({ message: 'Пользователь не авторизован' });
            }
        });
    }
    checkToken(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                if (!token) {
                    return res.status(401).json({ message: 'Пользователь не авторизован' });
                }
                const decodedData = jsonwebtoken_1.default.verify(token, config_1.config.secret);
                return res.json({ user: decodedData });
            }
            catch (e) {
                console.log(e);
                return res.status(401).json({ message: 'Пользователь не авторизован' });
            }
        });
    }
}
exports.default = new AdminController();
