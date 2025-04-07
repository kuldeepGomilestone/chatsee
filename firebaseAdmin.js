const admin = require("firebase-admin");

const serviceAccount = require("./chatsee-4a3fc-firebase-adminsdk-fbsvc-81c2e66b7e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (token, title, body) => {
  const message = {
    token,
    notification: { title, body }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = sendNotification;
