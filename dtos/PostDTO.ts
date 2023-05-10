import DefaultDTO from './DefaultDTO';
import UserDTO from './UserDTO';
import TagDTO from './TagDTO';
import { PostStatus } from '../models/Post';
import CommentDTO from './CommentDTO';

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

  constructor(model: any) {
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
  }
}

export class PostListItemDTO extends PostDTO {
  commentsCount: number;
  isFavorite: boolean;

  constructor(model: any) {
    super(model);
    this.commentsCount = model.comments?.length || 0;
    this.isFavorite = model.favoriteUsers?.contains(this.id) || false;
  }
}

export class PostDetailDTO extends PostListItemDTO {
  comments: CommentDTO[];

  constructor(model: any) {
    super(model);
    this.comments = model.comments.map((it: any) => new CommentDTO(it));
  }
}

export default PostDTO;
