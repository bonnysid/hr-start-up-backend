import DefaultDTO from './DefaultDTO';
import { UserCommentDto } from './UserDTO';

class MessageDTO extends DefaultDTO {
  text: string;
  updatedAt: string;
  createdAt: string;
  dialogId: string;
  read: boolean;
  user: UserCommentDto;

  constructor(model: any) {
    super(model);

    this.text = model.text;
    this.dialogId = model.dialogId;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.read = model.read;
    this.user = new UserCommentDto(model.user);
  }
}

export default MessageDTO;
