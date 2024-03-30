const mongoose = require('mongoose');

const ssebowaConversationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SsebowaMessage' }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// ssebowaConversationSchema.index({ createdAt: 1, updatedAt: 1 });

// const SsebowaConversation = mongoose.models.SsebowaConversation || mongoose.model('SsebowaConversation', ssebowaConversationSchema);

module.exports = ssebowaConversationSchema;
