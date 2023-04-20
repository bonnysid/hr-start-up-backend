"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VideoDTO {
    constructor(model) {
        this.id = model.id;
        this.title = model.title;
        this.description = model.description;
        this.path = model.path;
        this.likes = model.likes;
        this.author = model.author;
    }
}
exports.default = VideoDTO;
