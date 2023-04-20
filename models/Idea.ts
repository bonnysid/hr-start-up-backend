import { model, Schema } from 'mongoose';

const Idea = new Schema({
  value: {
    type: String,
    unique: true,
    required: true,
    default: 'USER',
  },
});

export default model('ideas', Idea);
