import DefaultDTO from './DefaultDTO';
import { UserCommentDto } from './UserDTO';

class CommentDTO extends DefaultDTO {
  text: string;
  updatedAt: string;
  createdAt: string;
  user: UserCommentDto;

  constructor(model: any) {
    super(model);

    this.text = model.text;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.user = new UserCommentDto(model.user);
  }
}

export default CommentDTO;
