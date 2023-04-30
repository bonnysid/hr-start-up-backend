import { model, Schema } from 'mongoose';

const Session = new Schema({
  ip: { type: Schema.Types.String },
  country: { type: Schema.Types.String },
  city: { type: Schema.Types.String },
});

export default model('sessions', Session);
