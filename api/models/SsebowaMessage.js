const mongoose = require('mongoose');
const ssebowaMessageSchema = require('./schema/ssebowaMessageSchema');
const SsebowaMessage = mongoose.models.SsebowaMessage || mongoose.model('SsebowaMessage', ssebowaMessageSchema);

module.exports = SsebowaMessage;
