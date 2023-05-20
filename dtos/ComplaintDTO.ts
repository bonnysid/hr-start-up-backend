import { UserCommentDto } from '../dtos/UserDTO';
import DefaultDTO from '../dtos/DefaultDTO';
import { ComplaintStatus, ComplaintType } from '../models/Complaint';
import { PostShortDTO } from '../dtos/PostDTO';
import MessageDTO from '../dtos/MessageDTO';

class ComplaintDTO extends DefaultDTO {
  text: string;
  status: ComplaintStatus;
  type: ComplaintType;
  post?: PostShortDTO;
  user?: UserCommentDto;
  author?: UserCommentDto;
  whoResolve?: UserCommentDto;
  updatedAt: string;
  createdAt: string;
  unreadableMessages: number;

  constructor(model: any) {
    super(model);
    this.text = model.text;
    this.author = new UserCommentDto(model.author);
    this.status = model.status;
    this.type = model.type;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.unreadableMessages = model.unreadableMessages;

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

export class ComplaintDetailDTO extends ComplaintDTO {
  messages: MessageDTO[] = [];

  constructor(model: any) {
    super(model);

    this.messages = model.messages.map((it: any) => new MessageDTO({ ...('toObject' in it ? it.toObject() : it), complaintId: this.id }))
  }
}

export class UserComplaintDTO extends DefaultDTO {
  text: string;
  status: ComplaintStatus;
  type: ComplaintType;
  post?: PostShortDTO;
  user?: UserCommentDto;
  author?: UserCommentDto;
  updatedAt: string;
  createdAt: string;
  unreadableMessages: number;

  constructor(model: any) {
    super(model);
    this.text = model.text;
    this.author = new UserCommentDto(model.author);
    this.status = model.status;
    this.type = model.type;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.unreadableMessages = model.unreadableMessages;

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

