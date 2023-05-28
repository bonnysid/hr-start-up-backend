import { model, Schema } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

const User = new Schema({
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  phone: {
    type: String,
  },
  isConfirmedEmail: {
    type: Boolean,
    default: false,
  },
  status: { type: String, default: UserStatus.ACTIVE },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  banReason: { type: Schema.Types.ObjectId, ref: 'banReasons' },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'sessions' }],
  tempEmailCode: { type: Schema.Types.String },
  tempEmail: { type: Schema.Types.String },
}, { timestamps: true });

export default model('users', User);
