import UserDTO from './UserDTO';

class VideoDTO {
  id: string;
  title: string;
  description?: string;
  path: string;
  likes: number;
  author: UserDTO;

  constructor(model: any) {
    this.id = model.id;
    this.title = model.title;
    this.description = model.description;
    this.path = model.path;
    this.likes = model.likes;
    this.author = model.author;
  }
}

export default VideoDTO;
