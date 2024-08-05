import userModel from "../models/user.js";
import Auth from "../common/auth.js";
import emailService from "../common/emailService.js";
import crypto from "crypto";
import convoModel from "../models/conversation.js";
import messageModel from "../models/messages.js";

const createUsers = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (!existingUser) {
      req.body.password = await Auth.hashPassword(req.body.password);
      await userModel.create(req.body);

      res.status(201).send({ message: "User created successfully" });
    } else {
      res.status(400).send({ message: `User with ${req.body.email} already exists` });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0, resetToken: 0, socketId: 0 });
 
    return res.status(200).send({
      message: "User Data Fetched Successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await userModel.findById(id, { password: 0, resetToken: 0, socketId: 0 });

    if (user) {
      res.send({
        message: "Data is fetched successfully",
        user,
      });
    } else {
      res.status(404).send({
        message: "User not found. Invalid ID.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const hashCompare = await Auth.hashCompare(req.body.password, user.password);
      if (hashCompare) {
        const token = await Auth.createToken({ name: user.name, email: user.email, role: user.role });

        let userData = await userModel.findOne({ email: req.body.email }, { password: 0, resetToken: 0, socketId: 0 });
        res.status(200).send({
          message: "User Logged in successfully",
          token,
          userData,
        });
      } else {
        res.status(400).send({ message: "Invalid password" });
      }
    } else {
      res.status(400).send({ message: "Account does not exist" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).send({ message: "senderId and receiverId are required" });
    }

    const receiver = await userModel.findById(receiverId, { password: 0, resetToken: 0, socketId: 0 });

    if (!receiver) {
      return res.status(404).send({ message: "Receiver not found" });
    }

    const existingConversation = await convoModel
      .findOne({
        members: { $all: [senderId, receiverId] },
      })
      .populate({
        path: "messages",
        populate: [
          { path: "senderId", select: "name" },
          { path: "receiverId", select: "name" },
        ],
      });

    if (existingConversation) {
      return res.status(200).json({
        conversationId: existingConversation._id,
        messages: existingConversation.messages.map((message) => ({
          conversationId: message.conversationId,
          senderId: message.senderId._id,
          receiverId: message.receiverId._id,
          message: message.message,
          senderName: message.senderId.name,
          receiverName: message.receiverId.name,
        })),
      });
    }

    const newConversation = new convoModel({ members: [senderId, receiverId] });
    const savedConversation = await newConversation.save();

    const initialMessage = `Hi ${receiver.name}`;

    const createdMessage = await messageModel.create({
      conversationId: savedConversation._id,
      senderId,
      receiverId,
      message: initialMessage,
    });

   
    savedConversation.messages.push(createdMessage._id);
    await savedConversation.save();

    const populatedMessage = await messageModel.findById(createdMessage._id).populate("senderId", "name").populate("receiverId", "name").exec();

    res.status(200).json({
      conversationId: savedConversation._id,
      messages: {
        conversationId: populatedMessage.conversationId,
        senderId: populatedMessage.senderId._id,
        receiverId: populatedMessage.receiverId._id,
        senderName: populatedMessage.senderId.name,
        receiverName: populatedMessage.receiverId.name,
        message: populatedMessage.message,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const getConvo = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Fetch conversations for the user
    const conversations = await convoModel.find({ members: { $in: [userId] } }).exec();

    // If no conversations are found, return an empty array
    if (conversations.length === 0) {
      return res.status(200).json([]);
    }

    // Filter out conversations with invalid members
    const validConversations = conversations.filter(conversation => 
      conversation.members.every(member => member !== null)
    );

    // Fetch user data and messages for each valid conversation
    const conversationUserData = await Promise.all(
      validConversations.map(async (conversation) => {
        const receiverId = conversation.members.find(member => member !== userId);

        if (!receiverId) {
          // Receiver ID not found; skip this conversation
          return null;
        }

        try {
          // Fetch receiver user details
          const user = await userModel.findById(receiverId, { password: 0, resetToken: 0, socketId: 0 }).exec();

          if (!user) {
            // User not found; skip this conversation
            return null;
          }

          // Fetch messages for the conversation
          const messages = await messageModel.find({ conversationId: conversation._id }).exec();

          return {
            userId: {
              _id: user._id,
              email: user.email,
              name: user.name,
            },
            conversationId: conversation._id,
            messages: messages.map(message => ({
              _id: message._id,
              senderId: message.senderId,
              content: message.content,
              createdAt: message.createdAt,
            })),
          };
        } catch (userError) {
          console.error(`Error fetching user details for receiver ID ${receiverId}:`, userError);
          return null;
        }
      })
    );

    // Filter out any null entries from conversationUserData
    const filteredConversationUserData = conversationUserData.filter(data => data !== null);

  
    res.status(200).json(filteredConversationUserData);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId } = req.body;

    if (!senderId || !message) {
      return res.status(400).send({ message: "Please fill all required fields" });
    }

    let newConversationId = conversationId;

    if (conversationId === "new" && receiverId) {
      const newConversation = new convoModel({ members: [senderId, receiverId] });
      const savedConversation = await newConversation.save();
      newConversationId = savedConversation._id;
    } else if (!conversationId && !receiverId) {
      return res.status(400).send({ message: "Conversation ID and Receiver ID are required" });
    }

    const newMessage = new messageModel({
      conversationId: newConversationId,
      senderId,
      receiverId,
      message,
    });

   

    const savedMessage = await newMessage.save();

    const populatedMessage = await messageModel.findById(savedMessage._id)
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .exec();

  

    res.status(200).json({
      conversationId: newConversationId,
      messages: {
        _id: savedMessage._id,
        conversationId: populatedMessage.conversationId,
        senderId: populatedMessage.senderId._id,
        receiverId: populatedMessage.receiverId._id,
        sender: {
          _id: populatedMessage.senderId._id,
          name: populatedMessage.senderId.name,
        },
        receiver: {
          _id: populatedMessage.receiverId._id,
          name: populatedMessage.receiverId.name,
        },
        message: populatedMessage.message,
        senderName: populatedMessage.senderId.name,
        receiverName: populatedMessage.receiverId.name,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getUserMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;

    const checkMessages = async (conversationId) => {
      try {
        const messages = await messageModel.find({ conversationId });

        const messageDetails = await Promise.all(
          messages.map(async (message) => {
            const sender = await userModel.findById(message.senderId, { password: 0, resetToken: 0, socketId: 0 });
            const receiver = await userModel.findById(message.receiverId, { password: 0, resetToken: 0, socketId: 0 });

            return {
              _id: message._id,
              sender: { id: sender._id, name: sender.name },
              receiver: { id: receiver._id, name: receiver.name },
              message: message.message,
              createdAt: message.createdAt,
            };
          })
        );

        return messageDetails;
      } catch (err) {
        console.error("Error fetching message details:", err);
        throw new Error("Error fetching message details");
      }
    };

    if (conversationId === "new") {
      const checkConversation = await convoModel.find({
        members: { $all: [req.query.senderId, req.query.receiverId] },
      });

      if (checkConversation.length > 0) {
        const messages = await checkMessages(checkConversation[0]._id);
        return res.status(200).json(messages);
      } else {
        return res.status(200).json([]);
      }
    } else {
      const messages = await checkMessages(conversationId);
      return res.status(200).json(messages);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email }, { password: 0 });

    if (user) {
      let code;
      let isCodeUnique = false;
      do {
        code = crypto.randomBytes(20).toString("hex");
        isCodeUnique = !(await userModel.exists({ resetToken: code }));
      } while (!isCodeUnique);

      user.resetToken.push(code);
      await user.save();

      await emailService.forgetPassword({ name: user.name, code, email: req.body.email });

      res.status(200).send({ message: "Reset Password verification code sent. Please check your email and confirm.", code });
    } else {
      res.status(400).send({ message: `Account with ${req.body.email} does not exist` });
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const data = await Auth.decodeToken(token);

    if (req.body.newpassword === req.body.confirmpassword) {
      const user = await userModel.findOne({ email: data.email });
      user.password = await Auth.hashPassword(req.body.newpassword);
      await user.save();

      res.status(200).send({ message: "Password Updated Successfully" });
    } else {
      res.status(400).send({ message: "Password Does Not match" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

export default {
  getUsers,
  getUserById,
  createUsers,
  login,
  createConversation,
  getConvo,
  sendMessage,
  getUserMessages,
  forgotPassword,
  resetPassword,
};
