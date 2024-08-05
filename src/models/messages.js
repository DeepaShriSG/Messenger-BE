import mongoose from '../models/index.js';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'conversation', 
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    message: String,
    createdAt: { type: Date, default: Date.now }
});

const messageModel = mongoose.model('message', messageSchema);
export default messageModel;
