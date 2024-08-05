import mongoose from 'mongoose';

// Define the conversation schema
const conversationSchema = new mongoose.Schema({
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user', 
        required: true,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    }]
}, {
    collection: "conversation",
    versionKey: false
});

// Create the conversation model
const convoModel = mongoose.model('conversation', conversationSchema);

export default convoModel;
