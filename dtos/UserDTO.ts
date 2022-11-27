class UserDTO {
  email?: string;
  username: string;
  roles: string[];
  id: string;
  isConfirmedEmail: boolean;
  phone?: string;
  firstName?: string;
  lastName?: string;

  constructor(model: any) {
    this.id = model._id;
    this.username = model.username;
    this.email = model.email;
    this.isConfirmedEmail = model.isConfirmedEmail;
    this.phone = model.phone;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.roles = model.roles;
  }
}

export default UserDTO;
