const { addMessage, getMessages, markMessageAsDelivered, markMessagesAsRead } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/mark/delivered/", markMessageAsDelivered);
router.post("/mark/read/", markMessagesAsRead);
router.post("/getmsg/", getMessages);

module.exports = router;
