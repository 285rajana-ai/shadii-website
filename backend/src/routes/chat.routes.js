const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.get('/:otherUserId/messages', chatController.getMessages);
router.post('/:otherUserId/send', chatController.sendMessage);
router.post('/:otherUserId/seen', chatController.markSeen);

module.exports = router;
