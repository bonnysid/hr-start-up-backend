import { model, Schema } from 'mongoose';

const User = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
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
  roles: [{ type: String, ref: 'roles' }],
  avatar: {
    type: String,
    required: false,
    default: null,
  }
});

export default model('users', User);
