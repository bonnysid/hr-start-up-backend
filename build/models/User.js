"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User = new mongoose_1.Schema({
    password: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    isConfirmedEmail: {
        type: Boolean,
        default: false,
    },
    roles: [{ type: String, ref: 'roles' }],
    avatar: {
        type: String,
        required: false,
        default: null,
    }
});
exports.default = (0, mongoose_1.model)('users', User);
