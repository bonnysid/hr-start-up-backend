import FileService, { File } from '../services/FileService';
import { config } from '../config';
import * as fs from 'fs';
import Video from '../models/Video';
import User from '../models/User';
import UserDTO from '../dtos/UserDTO';
import VideoDTO from '../dtos/VideoDTO';
import { Request, Response } from 'express';
import fileService from '../services/FileService';
import { v4 } from 'uuid';

class FileController {
  async getFiles(req: Request, res: Response) {

  }

  async uploadFile(req: any, res: Response) {
    try {
      const file = req.files.file

      const user = await User.findOne({_id: req.user.id})

      const path = `${config.videoPath}\\${user?._id}\\${file.name}`


      if (fs.existsSync(path)) {
        return res.status(400).json({message: 'File already exist'})
      }
      file.mv(path)

      const type = file.name.split('.').pop()
      let filePath = file.name

      const dbFile = new Video({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        user: user?._id
      });

      await dbFile.save()
      await user?.save()

      res.json(dbFile)
    } catch (e) {
      console.log(e)
      return res.status(500).json({message: "Upload error"})
    }
  }

  async deleteFile(req: any, res: Response) {
    try {
      const file = await Video.findOne({_id: req.query.id, authorId: req.user.id})
      if (!file) {
        return res.status(400).json({message: 'file not found'})
      }
      fileService.deleteFile({ path: file.path, authorId: req.user.id })
      await file.remove()
      return res.json({message: 'File was deleted'})
    } catch (e) {
      console.log(e)
      return res.status(400).json({message: 'Dir is not empty'})
    }
  }

  async searchFile(req: any, res: Response) {
    try {
      const searchName = req.query.search
      let files = await Video.find({user: req.user.id})
      files = files.filter(file => file.title.includes(searchName))
      return res.json(files)
    } catch (e) {
      console.log(e)
      return res.status(400).json({message: 'Search error'})
    }
  }

  async uploadAvatar(req: any, res: Response) {
    try {
      const file = req.files.file
      const user = await User.findById(req.user.id)
      const avatarName = v4() + ".jpg"
      file.mv(config.staticPath + "\\" + avatarName)
      if (user) {
        user.avatar = avatarName
        await user.save()
      }
      return res.json(user)
    } catch (e) {
      console.log(e)
      return res.status(400).json({message: 'Upload avatar error'})
    }
  }

  async deleteAvatar(req: any, res: Response) {
    try {
      const user = await User.findById(req.user.id)
      if (user) {
        fs.unlinkSync(config.staticPath + "\\" + user.avatar)
        // @ts-ignore
        user.avatar = null
        await user.save()
      }
      return res.json(user)
    } catch (e) {
      console.log(e)
      return res.status(400).json({message: 'Delete avatar error'})
    }
  }
}

module.exports = new FileController()
