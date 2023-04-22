import RoleDTO from './RoleDTO';
import DefaultDTO from './DefaultDTO';

class UserDTO extends DefaultDTO {
  email: string;
  roles: string[];
  isConfirmedEmail: boolean;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;

  constructor(model: any) {
    super(model)
    this.email = model.email;
    this.isConfirmedEmail = model.isConfirmedEmail;
    this.phone = model.phone;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.avatar = model.avatar;
    this.roles = model.roles.map((it: any) => new RoleDTO(it));
  }
}

export default UserDTO;
