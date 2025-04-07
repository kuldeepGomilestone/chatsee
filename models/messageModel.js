const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }
    ], // List of users in the chat, relevant for both 1-to-1 and 1-to-many
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ], // Tracking users who have read the message
    isRead: {
      type: Boolean,
      default: false, 
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: Date, // Timestamp for when the message was delivered
    readAt: {
      type: Date,
      default: null,
    },
    messageType: {
      type: String,
      enum: ['one-to-one', 'group'], // We use 'group' instead of 'one-to-many'
      required: true,
      default: 'one-to-one',

    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group", // Optional, for group chats only
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
