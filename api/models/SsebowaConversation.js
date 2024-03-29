const mongoose = require('mongoose');
const ssebowaConversationSchema = require('./schema/ssebowaConversationSchema');

const SsebowaConversation = mongoose.models.SsebowaConversation || mongoose.model('SsebowaConversation', ssebowaConversationSchema);

module.exports = SsebowaConversation;
