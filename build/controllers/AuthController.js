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
const User_1 = __importDefault(require("../models/User"));
const Role_1 = __importDefault(require("../models/Role"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const TokenService_1 = __importDefault(require("../services/TokenService"));
const UserDTO_1 = __importDefault(require("../dtos/UserDTO"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
class AuthController {
    registration(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({ message: 'Ошибка при регистрации', errors });
                }
                const { email, password, firstName, lastName } = req.body;
                const candidate = yield User_1.default.findOne({ email });
                if (candidate) {
                    return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
                }
                const hashPassword = bcryptjs_1.default.hashSync(password, 7);
                const userRole = yield Role_1.default.findOne({ value: 'USER' });
                const user = new User_1.default({ email, firstName, lastName, password: hashPassword, roles: [userRole] });
                yield user.save();
                res.json({ message: 'Пользоваетель был успешно зарегистрирован' });
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Registration error' });
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
                const userDTO = new UserDTO_1.default(candidate);
                const tokens = TokenService_1.default.generateTokens(Object.assign({}, userDTO));
                res.json(tokens);
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Login error' });
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield User_1.default.find();
                const userDTOS = users.map(it => new UserDTO_1.default(it));
                return res.json(userDTOS);
            }
            catch (e) {
                console.log(e);
                res.status(400).json({ message: 'Users error' });
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
}
exports.default = new AuthController();
