import { model, Schema } from 'mongoose';

export enum ComplaintStatus {
  RESOLVED = 'RESOLVED',
  UNRESOLVED = 'UNRESOLVED',
  CLOSED = 'CLOSED',
}

export enum ComplaintType {
  POST = 'POST',
  USER = 'USER',
}

const Complaint = new Schema({
  text: { type: Schema.Types.String, required: true },
  status: { type: Schema.Types.String, default: ComplaintStatus.UNRESOLVED },
  type: { type: Schema.Types.String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'posts' },
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  author: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  whoResolve: { type: Schema.Types.ObjectId, ref: 'users' }
}, { timestamps: true });

export default model('complaints', Complaint);
