import RoleDTO from './RoleDTO';
import DefaultDTO from './DefaultDTO';
import { UserStatus } from '../models/User';
import BanReasonDTO from './BanReasonDTO';

export class UserCommentDto extends DefaultDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;

  constructor(model: any) {
    super(model)
    this.email = model.email;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.avatar = model.avatar;
  }
}

class UserDTO extends UserCommentDto {
  roles: string[];
  isConfirmedEmail: boolean;
  phone?: string;
  updatedAt: string;
  createdAt: string;
  status?: string;
  banReason?: BanReasonDTO;

  constructor(model: any, isAdmin?: boolean) {
    super(model)
    this.isConfirmedEmail = model.isConfirmedEmail;
    this.phone = model.phone;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.status = model.status || UserStatus.ACTIVE;
    this.roles = model.roles.map((it: any) => new RoleDTO(it));
    this.banReason = isAdmin && model.banReason ? new BanReasonDTO(model.banReason, isAdmin) : undefined;
  }
}

export default UserDTO;
