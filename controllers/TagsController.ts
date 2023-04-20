import { Request, Response } from 'express';
import TagModel from '../models/Tag';
import TagDTO from '../dtos/TagDTO';

class TagsController {
  async getTags(req: Request, res: Response) {
    try {
      const tags = await TagModel.find();
      const tagsDTOS = tags.map(it => new TagDTO(it));

      return res.json(tagsDTOS);
    } catch (e) {
      console.log(e);
      return res.status(403).json({ message: 'Нету доступа' });
    }
  }
}

export default new TagsController();
