"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Video = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    path: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    authorId: { type: String, ref: 'users', required: true },
});
exports.default = (0, mongoose_1.model)('videos', Video);
