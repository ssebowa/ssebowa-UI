const SsebowaConversation = require('../../models/SsebowaConversation');
const SsebowaMessage = require('../../models/SsebowaMessage');
const express = require('express');
const router = express.Router();

// Create a new conversation
router.post('/ssebowa-conversation', async (req, res) => {
  const { user, title, messages } = req.body;

  try {
    const conversation = new SsebowaConversation({ user, title, messages });
    await conversation.save();
    res.send(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get all conversations
router.get('/ssebowa-conversation', async (req, res) => {
  try {
    const { id } = req.query;
    const conversations = await SsebowaConversation.find({ user: id })
      .sort({ createdAt: -1 })
      .populate('messages');
    res.send(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get all conversations
router.get('/ssebowa-conversation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await SsebowaConversation.findById(id).populate({
      path: 'messages',
      populate: {
        path: 'files',
        model: 'File',
      },
    });
    res.send(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a conversation
router.put('/ssebowa-conversation/:id', async (req, res) => {
  const { id } = req.params;
  const { user, title, messages } = req.body;

  try {
    const conversation = await SsebowaConversation.findByIdAndUpdate(
      id,
      { user, title, messages },
      { new: true },
    );
    res.send(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update conversation message
router.put('/ssebowa-conversation/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;

  try {
    const conversation = await SsebowaConversation.findByIdAndUpdate(
      id,
      { $push: { messages: messages } },
      { new: true },
    );
    res.send(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a conversation
router.delete('/ssebowa-conversation/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const conversation = await SsebowaConversation.findByIdAndDelete(id);
    res.send(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Create a new message
router.post('/ssebowa-message', async (req, res) => {
  const { sender, text, user, files, isImage } = req.body;
  try {
    const message = new SsebowaMessage({ sender, text, user, files, isImage, feedback: null });
    await message.save();
    res.send(message);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get all messages
router.get('/ssebowa-message', async (req, res) => {
  try {
    const messages = await SsebowaMessage.find({});
    res.send(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a message
router.put('/ssebowa-message/:id', async (req, res) => {
  const { id } = req.params;
  const { sender, text, user, feedback, isImage } = req.body;
  try {
    const message = await SsebowaMessage.findByIdAndUpdate(
      id,
      { sender, text, user, feedback, isImage },
      { new: true },
    );
    res.send(message);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Update a feedback
router.put('/ssebowa-message/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  try {
    const message = await SsebowaMessage.findByIdAndUpdate(id, { feedback }, { new: true });
    res.send(message);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a message
router.delete('/ssebowa-message/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const message = await SsebowaMessage.findByIdAndDelete(id);
    res.send(message);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
