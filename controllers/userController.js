const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    
    next(ex);
  }
};

const Messages = require("../models/messageModel");
const Users = require("../models/userModel");

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Fetch all users except the requesting user
    const users = await Users.find({ _id: { $ne: userId } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    // Calculate unread messages for each user
    const usersWithUnreadCounts = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await Messages.countDocuments({
          users: { $all: [userId, user._id] }, // Chats between the two users
          sender: user._id, // Messages sent by this user
          isRead: false, // Only unread messages
        });

        return {
          ...user._doc,
          unreadCount, // Attach unread count to the user
        };
      })
    );

    return res.json(usersWithUnreadCounts);
  } catch (ex) {
    next(ex);
  }
};


module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.setFcm = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userFcm = req.body.fcm;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        userFcm,
      },
      { new: true }
    );
    return res.json(userData);
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
