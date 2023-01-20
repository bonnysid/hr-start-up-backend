import * as fs from 'fs';
import { config } from '../config';

export interface File {
  authorId: string;
  path: string;
}

class FileService {

  createDir(file: File) {
    const filePath = `${config.videoPath}\\${file.authorId}\\${file.path}`
    return new Promise(((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath)
          return resolve({message: 'File was created'})
        } else {
          return reject({message: "File already exist"})
        }
      } catch (e) {
        return reject({message: 'File error'})
      }
    }))
  }

  deleteFile(file: File) {
    const path = this.getPath(file)
    fs.unlinkSync(path)
  }

  getPath(file: File) {
    return config.videoPath + '\\' + file.authorId + '\\' + file.path
  }
}


export default new FileService()
