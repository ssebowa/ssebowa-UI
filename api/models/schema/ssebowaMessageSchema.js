const mongoose = require('mongoose');

const ssebowaMessageSchema = mongoose.Schema({
  sender: {
    type: String,
    default: 'SsebowaAI',
  },
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  files: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'File',
  },
  isImage: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    default: null
  }
})

// const SsebowaMessage = mongoose.models.SsebowaMessage || mongoose.model('SsebowaMessage', ssebowaMessageSchema);

module.exports = ssebowaMessageSchema;