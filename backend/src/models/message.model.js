import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text:{
        type: String,
    },
    image: {    
        type: String,
    },
    vedio: {
        type: String,
    },


}, { timestamps: true }); //createdAt and updatedAt fields will be automatically added

const Message = mongoose.model('Message', messageSchema);
export default Message;