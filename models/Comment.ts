import { model, Schema } from 'mongoose';

export enum CommentStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

const Comment = new Schema({
  text: { type: Schema.Types.String, required: true },
  edited: { type: Schema.Types.Boolean, default: false },
  status: { type: Schema.Types.String, default: CommentStatus.ACTIVE },
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

export default model('comments', Comment);
