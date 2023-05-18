import { model, Schema } from 'mongoose';

const BanReason = new Schema({
  text: { type: Schema.Types.String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

export default model('banReasons', BanReason);
