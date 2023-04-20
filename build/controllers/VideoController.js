"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const config_1 = require("../config");
const fs = __importStar(require("fs"));
const Video_1 = __importDefault(require("../models/Video"));
const User_1 = __importDefault(require("../models/User"));
const FileService_1 = __importDefault(require("../services/FileService"));
const uuid_1 = require("uuid");
class FileController {
    getFiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    uploadFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.files.file;
                const user = yield User_1.default.findOne({ _id: req.user.id });
                const path = `${config_1.config.videoPath}\\${user === null || user === void 0 ? void 0 : user._id}\\${file.name}`;
                if (fs.existsSync(path)) {
                    return res.status(400).json({ message: 'File already exist' });
                }
                file.mv(path);
                const type = file.name.split('.').pop();
                let filePath = file.name;
                const dbFile = new Video_1.default({
                    name: file.name,
                    type,
                    size: file.size,
                    path: filePath,
                    user: user === null || user === void 0 ? void 0 : user._id
                });
                yield dbFile.save();
                yield (user === null || user === void 0 ? void 0 : user.save());
                res.json(dbFile);
            }
            catch (e) {
                console.log(e);
                return res.status(500).json({ message: "Upload error" });
            }
        });
    }
    deleteFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = yield Video_1.default.findOne({ _id: req.query.id, authorId: req.user.id });
                if (!file) {
                    return res.status(400).json({ message: 'file not found' });
                }
                FileService_1.default.deleteFile({ path: file.path, authorId: file.authorId });
                yield file.remove();
                return res.json({ message: 'File was deleted' });
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Dir is not empty' });
            }
        });
    }
    searchFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchName = req.query.search;
                let files = yield Video_1.default.find({ user: req.user.id });
                files = files.filter(file => file.title.includes(searchName));
                return res.json(files);
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Search error' });
            }
        });
    }
    uploadAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const file = req.files.file;
                const user = yield User_1.default.findById(req.user.id);
                const avatarName = (0, uuid_1.v4)() + ".jpg";
                file.mv(config_1.config.staticPath + "\\" + avatarName);
                if (user) {
                    user.avatar = avatarName;
                    yield user.save();
                }
                return res.json(user);
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Upload avatar error' });
            }
        });
    }
    deleteAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User_1.default.findById(req.user.id);
                if (user) {
                    fs.unlinkSync(config_1.config.staticPath + "\\" + user.avatar);
                    // @ts-ignore
                    user.avatar = null;
                    yield user.save();
                }
                return res.json(user);
            }
            catch (e) {
                console.log(e);
                return res.status(400).json({ message: 'Delete avatar error' });
            }
        });
    }
}
module.exports = new FileController();
