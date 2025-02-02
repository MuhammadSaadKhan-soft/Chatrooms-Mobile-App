const express = require('express');
const router = express.Router();
const groupModel = require('../models/groupmodel'); 
const Room=require("../models/Rooms")
router.post('/', async (req, res) => {
    try {
        console.log('Incoming request body:', req.body); 
        const { roomId, text, sender } = req.body;
        console.log(req.body)
        if (!roomId || !text || !sender) {
            return res.status(400).json({ error: 'Missing required fields' }); 
        }

        const message = new groupModel({
            roomId,
            text,
            sender
        });
        await message.save();
        console.log('Message saved:', message); 
        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error); 
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:roomId', async (req, res) => {
  try {
      const email = req.params.name;
      const roomId = req.params.roomId;

      const messages = await groupModel.find({ roomId }).populate('sender');
      const sender = messages.find(message => message.sender ===email);

      const responseData = {
          sender,
          messages
      };

      res.status(200).json(responseData);
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Server error' });
  }
});
// Route for editing a message
router.put('/edit/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing required field: text' });
        }

        // Find the message by ID and update the text
        const updatedMessage = await groupModel.findByIdAndUpdate(
            messageId,
            { text },
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        console.log('Message updated:', updatedMessage);
        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
