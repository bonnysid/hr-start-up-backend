import { Request, Response } from 'express';
import PostModel, { PostStatus } from '../models/Post';
import Comment from '../models/Comment';
import PostDTO, { PostDetailDTO, PostListItemDTO } from '../dtos/PostDTO';
import fs from 'fs';
import { v4 } from 'uuid';
import { getVideoDurationInSeconds } from 'get-video-duration';
import { validationResult } from 'express-validator';
import CommentDTO from '../dtos/CommentDTO';

class PostsController {
  async getPosts(req: Request, res: Response) {
    try {
      const {
        search = '',
        tags,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';

      const user = (req as any).user;
      const posts = await PostModel.find({
        status: PostStatus.ACTIVE,
        user: {$ne: user.id},
        title: new RegExp(String(search), 'i'),
        favoriteUsers: {$ne: user.id},
        ...(tags ? {tags: {$in: tags}} : {}),
      }).sort({[String(sort)]: sortValueParsed}).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, {path: 'tags'}]).exec();
      const postsDTOS = posts.map(it => new PostListItemDTO(it, (req as any).user));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async getFavoritePosts(req: Request, res: Response) {
    try {
      const {user} = req as any;
      const {
        search = '',
        tags,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';

      const posts = await PostModel.find({
        status: PostStatus.ACTIVE,
        title: new RegExp(String(search), 'i'),
        user: {$ne: user.id},
        favoriteUsers: user.id,
        ...(tags ? {tags: {$in: tags}} : {}),
      }).sort({[String(sort)]: sortValueParsed}).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, {path: 'tags'}]).exec();

      return res.json(posts.map(it => new PostListItemDTO(it, (req as any).user)));
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async favoritePost(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const {user} = req as any;

      const post = await PostModel.findOne({
        status: PostStatus.ACTIVE,
        _id: id,
        user: {$ne: user.id},
      });

      if (!post) {
        return res.status(404).json({message: 'Пост не найден'})
      }

      if (!post.favoriteUsers.map(it => it.toString()).includes(user.id)) {
        post.favoriteUsers = [...post.favoriteUsers, user.id];
        await post.save();
      } else {
        return res.status(400).json({message: 'Пост уже в избранном'})
      }

      return res.json({message: 'Пост успешно добавлен в избранное'});
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async unFavoritePost(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const {user} = req as any;

      const post = await PostModel.findOne({
        status: PostStatus.ACTIVE,
        _id: id,
      });

      if (!post) {
        return res.status(404).json({message: 'Пост не найден'})
      }

      post.favoriteUsers = post.favoriteUsers.filter(it => it.toString() !== user.id);
      await post.save();

      return res.json({message: 'Пост успешно убран из избранного'});
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async getPost(req: Request, res: Response) {
    try {
      const {id} = req.params;

      const post = await PostModel.findOne({status: PostStatus.ACTIVE, _id: id}).populate([
        {
          path: 'user',
          populate: {
            path: 'roles',
          },
        },
        { path: 'tags' },
        {
          path: 'comments',
          populate: {
            path: 'user',
          },
        }
      ]).exec();

      if (!post) {
        return res.status(404).json({message: 'Пост не найден'})
      }

      post.views += 1;
      await post.save();

      return res.json(new PostDetailDTO(post, (req as any).user));
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const {id} = req.params;
      const post = await PostModel.findOne({_id: id, user: user.id});

      if (!post) {
        return res.status(400).json({message: 'Пост не найден'})
      }

      if (post.videoUrl) {
        fs.unlinkSync(post.videoUrl?.replace(`http://${req.headers.host}/`, ''))
      }

      await Promise.all(post.comments.map(async it => {
        await Comment.findByIdAndDelete(it);
      }));

      await post.remove();

      return res.json({message: 'Пост успешно удален'});
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async addCommentToPost(req: Request, res: Response) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({message: 'Ошибка при создании', errors});
      }

      const {postId, text} = req.body;
      const {user} = req as any;

      const post = await PostModel.findOne({_id: postId});

      if (!post) {
        return res.status(400).json({message: 'Пост не найден'})
      }

      const comment = new Comment({text, user: user.id});
      await comment.save();

      post.comments = [...(post.comments || []), comment._id];
      await post.save();

      return res.json(new CommentDTO({ ...comment.toObject(), user }))
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async removeComment(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const {user} = req as any;

      const post = await PostModel.findOne({comments: id});

      if (!post) {
        return res.status(400).json({message: 'Пост не найден'})
      }

      const comment = await Comment.findOne({_id: id});

      if (!comment) {
        return res.status(400).json({message: 'Комментарий не найден'})
      }

      if (comment.user.toString() !== user.id) {
        return res.status(403).json({message: 'У вас не прав удалить этот комментарий'})
      }

      post.comments = (post.comments || []).filter(it => it.toString() !== id);
      await post.save();
      await comment.delete();

      return res.json({ message: 'Комментарий успешно удален' })
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async editComment(req: Request, res: Response) {
    try {
      const { user } = req as any;
      const { text } = req.body;
      const { id } = req.params;

      const comment = await Comment.findOne({_id: id, user: user.id});

      if (!comment) {
        return res.status(400).json({message: 'Комментарий не найден'})
      }

      comment.text = text;

      await comment.save();

      return res.json(new CommentDTO({ ...comment, user }))
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async getUserPosts(req: Request, res: Response) {
    try {
      const {userId} = req.params;
      const {
        search = '',
        tags,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';

      const posts = await PostModel.find({
        user: userId,
        status: PostStatus.ACTIVE,
        title: new RegExp(String(search), 'i'),
        ...(tags ? {tags: {$in: tags}} : {}),
      }).sort({[String(sort)]: sortValueParsed}).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, {path: 'tags'}]).exec();
      const postsDTOS = posts.map(it => new PostListItemDTO(it, (req as any).user));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async getMyPosts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const {
        search = '',
        tags,
        sort = 'createdAt',
        sortValue = 'desc',
      } = req.query;

      const sortValueParsed = sortValue === 'desc' ? 'desc' : 'asc';
      const posts = await PostModel.find({
        user: user.id,
        title: new RegExp(String(search), 'i'),
        ...(tags ? {tags: {$in: tags}} : {}),
      }).sort({[String(sort)]: sortValueParsed}).populate([{
        path: 'user',
        populate: {
          path: 'roles',
        },
      }, {path: 'tags'}]).exec();
      const postsDTOS = posts.map(it => new PostListItemDTO(it, (req as any).user));

      return res.json(postsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(500).json({message: 'Server error'});
    }
  }

  async createPost(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'Ошибка при создании', errors});
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

      if (parsedTags.length > 3) {
        return res.status(400).json({ message: 'Нельзя иметь больше 3 тегов' })
      }

      const user = (req as any).user;

      const videoDuration = await getVideoDurationInSeconds(file.path);

      const fileName = user.id;
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${v4()}.${fileName}.${fileExtension}`;
      const newFilePath = `videos/${newFileName}`;
      const videoUrl = `http://${req.headers.host}/videos/${newFileName}`;

      if (videoDuration > 30) {
        fs.unlinkSync(file.path);
        return res.status(400).json({error: 'Длительность видео не должна привышать 30 секунд'});
      }

      fs.renameSync(file.path, newFilePath);

      const post = new PostModel({title, description, shortDescription, tags: parsedTags, videoUrl, user: user.id});
      await post.save();

      return res.json({success: true, videoUrl, id: post._id });
    } catch (err) {
      console.error(err);
      fs.unlinkSync(file.path);
      res.status(500).json({ message: 'Server error' });    }
  }

  async editPost(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({message: 'Ошибка при создании', errors});
    }

    try {
      const {
        title,
        description,
        shortDescription,
        tags,
      } = req.body;

      const { id } = req.params;

      if (tags.length > 3) {
        return res.status(400).json({ message: 'Нельзя иметь больше 3 тегов' })
      }

      const user = (req as any).user;

      const post = await PostModel.findOne({ _id: id, user: user.id, status: PostStatus.ACTIVE }).populate([
        {
          path: 'user',
          populate: {
            path: 'roles',
          },
        },
        { path: 'tags' }]).exec();

      if (!post) {
        return res.status(400).json({ message: 'Пост не найден' })
      }

      post.title = title || post.title;
      post.description = description || post.description;
      post.shortDescription = shortDescription || post.shortDescription;
      post.tags = tags || post.tags;

      await post.save();

      return res.json(new PostDTO(post));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new PostsController();
