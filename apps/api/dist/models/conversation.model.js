import mongoose, { Schema } from "mongoose";
// Define the conversation types enum
var ConversationType;
(function (ConversationType) {
    ConversationType["Direct"] = "direct";
    ConversationType["Group"] = "group"; // Extensible for future use
})(ConversationType || (ConversationType = {}));
// Define the schema
const ConversationSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(ConversationType),
        default: ConversationType.Direct,
        required: true
    },
    participants: {
        type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        required: true,
        validate: {
            validator: function (participants) {
                // For direct conversations, ensure exactly 2 participants
                if (this.type === ConversationType.Direct) {
                    return participants.length === 2;
                }
                // For group conversations, allow more than 2 participants
                return participants.length >= 2;
            },
            message: 'Direct conversations must have exactly 2 participants'
        },
        // Ensure participants are unique
        set: function (value) {
            // Remove duplicates while preserving order
            return [...new Set(value)];
        }
    },
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false
});
// Index for optimized querying by participant
ConversationSchema.index({ "participants": 1 });
// Create and export the model
export const Conversation = mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);
//# sourceMappingURL=conversation.model.js.map