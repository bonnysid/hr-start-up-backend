"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserDTO {
    constructor(model) {
        this.id = model.id;
        this.email = model.email;
        this.isConfirmedEmail = model.isConfirmedEmail;
        this.phone = model.phone;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.roles = model.roles;
    }
}
exports.default = UserDTO;
