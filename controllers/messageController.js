const Messages = require("../models/messageModel");
const sendNotification = require("../firebaseAdmin");
const User = require("../models/userModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    // Fetch messages between two users
    const messages = await Messages.find({
      users: {
        $all: [from, to], // Ensure both 'from' and 'to' are present in the users array
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        messageId: msg._id,
        fromSelf: msg.sender.toString() === from, // Check if the message is sent by 'from'
        message: msg.message.text, // Message content
        status: msg.status, // Message status (sent, delivered, read)
        sentAt: msg.sentAt, // Timestamp when the message was sent
        deliveredAt: msg.deliveredAt, // Timestamp when the message was delivered
        readAt: msg.readAt, // Timestamp when the message was read (if applicable)
        readBy: msg.readBy, // Users who have read the message
        isRead: msg.isRead, // Users who have read the message
        messageType: msg.messageType, // Message type (1-to-1 or group)
      };
    });

    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const user = await User.findById(to);
  

    // Create the message entry with all necessary fields
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      status: "sent", // Initially set the message status to 'sent'
      messageType: "one-to-one", // Assuming it's a one-to-one message, adjust for group messages
      sentAt: Date.now(), // Set the sent timestamp
    });

    if(user)
      {
        const userToken = user?.userFcm;
        if(userToken)
        sendNotification(userToken, "New Message", message);
        
      }

    if (data) {
      return res.json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Failed to add message to the database." });
    }
  } catch (ex) {
    next(ex);
  }
};


module.exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { messageIds, userId } = req.body; // Accept an array of message IDs

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ msg: "Invalid or empty messageIds array" });
    }

    // Update all messages in a single operation
    const updatedMessages = await Messages.updateMany(
      { _id: { $in: messageIds }, users: userId, isRead: false },
      { $set: { status: "read", readAt: Date.now(),isRead:true }, $addToSet: { readBy: userId } } // Use $addToSet to avoid duplicates
    );

    if (updatedMessages.nModified === 0) {
      return res.status(400).json({ msg: "No messages were updated, they may already be marked as read or not accessible to this user." });
    }

    return res.json({
      msg: "Messages marked as read",
      updatedCount: updatedMessages.nModified, // Optional: provide number of updated messages
    });
  } catch (ex) {
    next(ex);
  }
};


module.exports.markMessageAsDelivered = async (req, res, next) => {
  try {
    const { messageId, userId } = req.body;

    // Find the message by its ID
    const message = await Messages.findById(messageId);

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    // Check if the user is in the message's user array
    if (!message.users.includes(userId)) {
      return res.status(403).json({ msg: "You are not authorized to update this message" });
    }

    // Update message status to delivered and set the delivered timestamp
    message.status = "delivered";
    message.deliveredAt = Date.now();

    // Save the updated message
    await message.save();

    return res.json({ msg: "Message marked as delivered" });
  } catch (ex) {
    next(ex);
  }
};

