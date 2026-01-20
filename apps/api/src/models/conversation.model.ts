import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
  type Document
} from "mongoose";
import { User } from "./user.model.js";

// Define the conversation types enum
enum ConversationType {
  Direct = "direct",
  Group = "group" // Extensible for future use
}

// Define the schema
const ConversationSchema = new Schema(
  {
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
        validator: function(this: any, participants: mongoose.Types.ObjectId[]) {
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
      set: function(value: mongoose.Types.ObjectId[]) {
        // Remove duplicates while preserving order
        return [...new Set(value)];
      }
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false
  }
);

// Index for optimized querying by participant
ConversationSchema.index({ "participants": 1 });

// Define the TypeScript types
export interface IConversationDocument extends Document {
  type: ConversationType;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IConversation = InferSchemaType<typeof ConversationSchema>;

// Create and export the model
export const Conversation: Model<IConversation> = mongoose.models.Conversation || 
  mongoose.model<IConversation>("Conversation", ConversationSchema);