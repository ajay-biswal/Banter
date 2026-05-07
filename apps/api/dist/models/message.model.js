import mongoose, { Schema } from "mongoose";
// ---- ENUMS ---- //
export var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType || (MessageType = {}));
export var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["SENT"] = "sent";
    DeliveryStatus["DELIVERED"] = "delivered";
    DeliveryStatus["READ"] = "read";
})(DeliveryStatus || (DeliveryStatus = {}));
// ---- SCHEMA ---- //
const MessageSchema = new Schema({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Core content
    content: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    // Message type
    type: {
        type: String,
        enum: Object.values(MessageType),
        default: MessageType.TEXT,
        required: true
    },
    // For media / files / extensibility
    metadata: {
        type: Schema.Types.Mixed
        // Example:
        // { url, fileName, size, mimeType }
    },
    // ---- DELIVERY SYSTEM ---- //
    deliveredTo: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            deliveredAt: { type: Date }
        }
    ],
    readBy: [
        {
            userId: { type: Schema.Types.ObjectId, ref: "User" },
            readAt: { type: Date }
        }
    ],
    // ---- ORDERING ---- //
    sequence: {
        type: Number,
        required: false
        // Increment per conversation
    },
    // ---- STATUS (fallback / quick UI) ---- //
    status: {
        type: String,
        enum: Object.values(DeliveryStatus),
        default: DeliveryStatus.SENT
    },
    // ---- EDIT / DELETE ---- //
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date,
    editedAt: Date,
    // ---- CLIENT-SIDE SUPPORT ---- //
    clientId: {
        type: String
        // Used for deduplication (VERY IMPORTANT)
    }
}, {
    timestamps: true,
    versionKey: false
});
// ---- INDEXES ---- //
// 🔥 Critical for chat performance
MessageSchema.index({ conversationId: 1, sequence: -1 });
// 🔥 Fallback ordering
MessageSchema.index({ conversationId: 1, createdAt: -1 });
// 🔥 Deduplication
MessageSchema.index({ clientId: 1 }, { sparse: true });
// 🔥 Partial index (ignore deleted)
MessageSchema.index({ conversationId: 1, sequence: -1 }, { partialFilterExpression: { isDeleted: false } });
export const Message = mongoose.models.Message ||
    mongoose.model("Message", MessageSchema);
//# sourceMappingURL=message.model.js.map