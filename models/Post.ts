import { model, Schema } from 'mongoose';

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

const Post = new Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
  },
  status: {
    type: String,
    default: PostStatus.ACTIVE,
  },
  tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }],
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  favoriteUsers: [{ type: Schema.Types.ObjectId, ref: 'users' }],
}, { timestamps: true });

export default model('posts', Post);
