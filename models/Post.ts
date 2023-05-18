import { model, Schema } from 'mongoose';

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
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
  views: {
    type: Schema.Types.Number,
    default: 0,
  },
  banReason: { type: Schema.Types.ObjectId, ref: 'banReasons' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }],
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  favoriteUsers: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'comments' }],
}, { timestamps: true });

export default model('posts', Post);
