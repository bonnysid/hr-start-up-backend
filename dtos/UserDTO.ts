class UserDTO {
  email: string;
  roles: string[];
  id: string;
  isConfirmedEmail: boolean;
  phone?: string;
  firstName?: string;
  lastName?: string;

  constructor(model: any) {
    this.id = model.id;
    this.email = model.email;
    this.isConfirmedEmail = model.isConfirmedEmail;
    this.phone = model.phone;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.roles = model.roles;
  }
}

export default UserDTO;
