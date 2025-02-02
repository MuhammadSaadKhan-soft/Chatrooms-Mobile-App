const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  githubId: { type: String, unique: true },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordCode: {
    type: String,
  },
  resetPasswordCodeExpiry: {
    type: Date,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,  
  },
  interest: {
    type: [String],  
  },
  date: {
    type: Date,
    default: Date.now,
  },
 
});


module.exports = mongoose.model('User', UserSchema);
