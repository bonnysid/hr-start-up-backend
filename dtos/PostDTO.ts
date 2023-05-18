import DefaultDTO from './DefaultDTO';
import UserDTO from './UserDTO';
import TagDTO from './TagDTO';
import { PostStatus } from '../models/Post';
import CommentDTO from './CommentDTO';
import { CommentStatus } from '../models/Comment';
import BanReasonDTO from '../dtos/BanReasonDTO';

export class PostShortDTO extends DefaultDTO {
  title: string;

  constructor(model: any) {
    super(model)
    this.title = model.title;
  }
}

class PostDTO extends DefaultDTO {
  title: string;
  description: string;
  shortDescription: string;
  updatedAt: string;
  createdAt: string;
  views: number;
  favoriteCount: number;
  user: UserDTO;
  tags: TagDTO[];
  status: PostStatus;
  videoUrl: string;
  banReason?: BanReasonDTO;

  constructor(model: any, isAdmin?: boolean) {
    super(model)
    this.title = model.title;
    this.videoUrl = model.videoUrl;
    this.status = model.status;
    this.description = model.description;
    this.updatedAt = model.updatedAt;
    this.createdAt = model.createdAt;
    this.views = model.views;
    this.favoriteCount = model.favoriteUsers?.length || 0;
    this.shortDescription = model.shortDescription;
    this.user = new UserDTO(model.user);
    this.tags = model.tags.map((tag: any) => new TagDTO(tag));
    this.banReason = this.status === PostStatus.BANNED ? new BanReasonDTO(model.banReason, isAdmin) : undefined;
  }
}

export class PostListItemDTO extends PostDTO {
  commentsCount: number;
  isFavorite: boolean;

  constructor(model: any, user: any, isAdmin?: boolean) {
    super(model, isAdmin);
    this.commentsCount = model.comments?.filter((it: any) => isAdmin || it.status === CommentStatus.ACTIVE).length || 0;
    this.isFavorite = model.favoriteUsers?.map((it: any) => it.toString()).includes(user.id) || false;
  }
}

export class PostDetailDTO extends PostListItemDTO {
  comments: CommentDTO[];

  constructor(model: any, user: any, isAdmin?: boolean) {
    super(model, user, isAdmin);
    this.comments = model.comments.filter((it: any) => isAdmin || it.status === CommentStatus.ACTIVE).map((it: any) => new CommentDTO(it));
  }
}

export default PostDTO;
