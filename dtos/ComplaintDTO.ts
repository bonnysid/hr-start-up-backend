import { UserCommentDto } from '../dtos/UserDTO';
import DefaultDTO from '../dtos/DefaultDTO';
import { ComplaintStatus, ComplaintType } from '../models/Complaint';
import { PostShortDTO } from '../dtos/PostDTO';

class ComplaintDTO extends DefaultDTO {
  text: string;
  status: ComplaintStatus;
  type: ComplaintType;
  post?: PostShortDTO;
  user?: UserCommentDto;
  author?: UserCommentDto;
  whoResolve?: UserCommentDto;

  constructor(model: any) {
    super(model);
    this.text = model.text;
    this.author = new UserCommentDto(model.author);
    this.status = model.status;
    this.type = model.type;

    if ([ComplaintStatus.CLOSED, ComplaintStatus.RESOLVED].includes(this.status)) {
      this.whoResolve = new UserCommentDto(model.whoResolve);
    }

    switch (this.type) {
      case ComplaintType.USER:
        this.user = new UserCommentDto(model.userId);
        break;
      case ComplaintType.POST:
        this.post = new PostShortDTO(model.postId);
        break;
    }
  }
}

export class UserComplaintDTO extends DefaultDTO {
  text: string;
  status: ComplaintStatus;
  type: ComplaintType;
  post?: PostShortDTO;
  user?: UserCommentDto;
  author?: UserCommentDto;

  constructor(model: any) {
    super(model);
    this.text = model.text;
    this.author = new UserCommentDto(model.author);
    this.status = model.status;
    this.type = model.type;

    switch (this.type) {
      case ComplaintType.USER:
        this.user = new UserCommentDto(model.userId);
        break;
      case ComplaintType.POST:
        this.post = new PostShortDTO(model.postId);
        break;
    }
  }
}

export default ComplaintDTO;

