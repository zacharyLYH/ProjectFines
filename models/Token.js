const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
  {
    refreshToken: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    policeMongoID: {
      type: mongoose.Types.ObjectId,
      ref: 'Police',
    },
    userMongoID: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    adminMongoID: {
      type: mongoose.Types.ObjectId,
      ref: 'Admin',
    },
    role: {
      type:String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Token', TokenSchema);