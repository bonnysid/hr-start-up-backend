import { Request, Response } from 'express';
import PostModel, { PostStatus } from '../models/Post';
import PostDTO from '../dtos/PostDTO';
import fs from 'fs';
import { v4 } from 'uuid';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { validationResult } from 'express-validator';

class PostsController {
  async getPosts(req: Request, res: Response) {
    try {
      const {
        search = '',
        tags,
      } = req.query;
      const user = (req as any).user;
      const posts = await PostModel.find({
        status: PostStatus.ACTIVE,
        user: { $not: new RegExp(user.id) },
        title: new RegExp(String(search), 'i') ,
        ...(tags ? { tags: { $in: tags } } : {}),
      }).sort({ createdAt: 'desc' }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();
      const postsDTOS = posts.map(it => new PostDTO(it));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getFavoritePosts(req: Request, res: Response) {
    try {
      const { user } = req as any;

      const post = await PostModel.findOne({
        status: PostStatus.ACTIVE,
        user: { $not: new RegExp(user.id) },
        favoriteUsers: user.id,
      }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' })
      }

      return res.json(new PostDTO(post));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async favoritePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req as any;

      const post = await PostModel.findOne({
        status: PostStatus.ACTIVE,
        _id: id,
      });

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' })
      }

      post.favoriteUsers = [...post.favoriteUsers, user.id];
      await post.save();

      return res.json({ message: 'Пост успешно добавлен в избранное' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async unFavoritePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { user } = req as any;

      const post = await PostModel.findOne({
        status: PostStatus.ACTIVE,
        _id: id,
      });

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' })
      }

      post.favoriteUsers = post.favoriteUsers.filter(it => it !== user.id);
      await post.save();

      return res.json({ message: 'Пост успешно убран из избранного' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getPost(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const post = await PostModel.findOne({ status: PostStatus.ACTIVE, _id: id }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();

      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' })
      }

      return res.json(new PostDTO(post));
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const post = await PostModel.findOne({ _id: id, user: user.id });

      if (!post) {
        return res.status(400).json({message: 'Пост не найден'})
      }

      if (post.videoUrl) {
        fs.unlinkSync(post.videoUrl?.replace(`http://${req.headers.host}/`, ''))
      }

      await post.remove();

      return res.json({ message: 'Пост успешно удален' });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getUserPosts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const posts = await PostModel.find({ user: userId, status: PostStatus.ACTIVE }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();
      const postsDTOS = posts.map(it => new PostDTO(it));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async getMyPosts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const posts = await PostModel.find({ user: user.id }).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, { path: 'tags' }]).exec();
      const postsDTOS = posts.map(it => new PostDTO(it));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async createPost(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Ошибка при создании', errors });
    }

    const file = (req as any).file;

    try {
      const {
        title,
        description,
        shortDescription,
        tags,
      } = req.body;

      const parsedTags = JSON.parse(tags);

      const user = (req as any).user;

      const videoDuration = await getVideoDurationInSeconds(file.path);

      const fileName = user.id;
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${v4()}.${fileName}.${fileExtension}`;
      const newFilePath = `videos/${newFileName}`;
      const videoUrl = `http://${req.headers.host}/videos/${newFileName}`;

      if (videoDuration > 30) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Длительность видео не должна привышать 30 секунд' });
      }

      fs.renameSync(file.path, newFilePath);

      const post = new PostModel({ title, description, shortDescription, tags: parsedTags, videoUrl, user: user.id });
      await post.save();

      return res.json({ success: true, videoUrl });
    } catch (err) {
      console.error(err);
      fs.unlinkSync(file.path);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
}

export default new PostsController();
