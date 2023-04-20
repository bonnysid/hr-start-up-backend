import { Request, Response } from 'express';
import PostModel, { PostStatus } from '../models/Post';
import PostDTO from '../dtos/PostDTO';

class PostsController {
  async getPosts(req: Request, res: Response) {
    try {
      const posts = await PostModel.find({ status: PostStatus.ACTIVE }).populate('user', 'tags').exec();
      const postsDTOS = posts.map(it => new PostDTO(it));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        shortDescription,
        tags,
        videoUrl,
      } = req.body;

      const user = (req as any).user;

      const post = new PostModel({ title, description, shortDescription, tags, videoUrl, user: user.id });
      await post.save();

      const savedPost = post.populate('tags', 'user')

      return res.json(new PostDTO(savedPost));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new PostsController();
