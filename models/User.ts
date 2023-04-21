import { model, Schema } from 'mongoose';

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
  },
  phone: {
    type: String,
  },
  isConfirmedEmail: {
    type: Boolean,
    default: false,
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'roles' }],
  avatar: {
    type: String,
    required: false,
    default: null,
  }
});

export default model('users', User);
