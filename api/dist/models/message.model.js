import mongoose, { Schema } from "mongoose";
// Define the message types enum
var MessageType;
(function (MessageType) {
    MessageType["Text"] = "text";
    MessageType["Image"] = "image";
    MessageType["File"] = "file"; // Extensible for future use
})(MessageType || (MessageType = {}));
// Define the message status enum
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["Sent"] = "sent";
    MessageStatus["Delivered"] = "delivered";
    MessageStatus["Read"] = "read";
})(MessageStatus || (MessageStatus = {}));
// Define the schema
const MessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000 // Reasonable limit for message content
    },
    type: {
        type: String,
        enum: Object.values(MessageType),
        default: MessageType.Text,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(MessageStatus),
        default: MessageStatus.Sent,
        required: true
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false
});
// Index for efficient retrieval of messages in a conversation (pagination)
MessageSchema.index({ conversationId: 1, createdAt: 1 });
// Index for efficient querying by sender
MessageSchema.index({ senderId: 1 });
// Index for efficient querying by status
MessageSchema.index({ status: 1 });
// Create and export the model
export const Message = mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);
//# sourceMappingURL=message.model.js.map