import { model, Schema } from 'mongoose';

const Comment = new Schema({
  text: { type: Schema.Types.String, required: true },
  edited: { type: Schema.Types.Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

export default model('comments', Comment);
