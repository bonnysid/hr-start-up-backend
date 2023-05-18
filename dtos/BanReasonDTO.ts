import UserDTO from '../dtos/UserDTO';
import DefaultDTO from '../dtos/DefaultDTO';

class BanReasonDTO extends DefaultDTO {
  text: string;
  user?: UserDTO;

  constructor(model: any, isAdmin?: boolean) {
    super(model);
    this.text = model.text;
    this.user = isAdmin ? new UserDTO(model.user) : undefined;
  }
}

export default BanReasonDTO;

