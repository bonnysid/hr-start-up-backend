import { model, Schema } from 'mongoose';
import User from './User';

const Video = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  path: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  authorId: { type: String, ref: 'users', required: true },
});

export default model('videos', Video);
