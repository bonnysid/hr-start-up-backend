import { Request, Response } from 'express';
import PostModel, { PostStatus } from '../models/Post';
import PostDTO from '../dtos/PostDTO';


import multer from 'multer';
import path from 'path';

import { spawn  } from 'child_process';
import { pipeline, Transform  } from 'stream';
import fs from 'fs';
import { v4 } from 'uuid';

async function getVideoDuration(filePath: string): Promise<number> {
  const ffprobe = spawn('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath
  ], { shell: true });

  return new Promise((resolve, reject) => {
    let stdout = '';
    const parseDuration = new Transform({
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        stdout += chunk.toString();
        callback(null, chunk);
      },
      flush(callback) {
        try {
          resolve(parseFloat(stdout.trim()));
        } catch (error) {
          reject(error);
        }
        callback();
      }
    });

    ffprobe.stdout?.on('error', (err: Error) => reject(err));
    parseDuration.on('error', (err: Error) => reject(err));

    pipeline(ffprobe.stdout, parseDuration, (err) => {
      if (err) {
        reject(err);
      }
    });
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'videos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${v4()}_${file.originalname}`);
  },
});

export const upload = multer({ storage });

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

  async createTestPost(req: Request, res: Response) {
    const file = (req as any).file;

    try {
      const {
        title,
        description,
        shortDescription,
        tags,
      } = req.body;

      const user = (req as any).user;

      const videoDuration = await getVideoDuration(file.path);

      if (videoDuration > 10) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Длительность видео не должна привышать 10 секунд' });
      }

      const post = new PostModel({ title, description, shortDescription, tags, videoUrl: file.path, user: user.id });
      await post.save();

      const savedPost = post.populate('tags', 'user')

      return res.json(new PostDTO(savedPost));
    } catch (err) {
      console.error(err);
      fs.unlinkSync(file.path);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
}

export default new PostsController();
