import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
  type Document
} from "mongoose";

// Define the message types enum
enum MessageType {
  Text = "text",
  Image = "image",
  File = "file" // Extensible for future use
}

// Define the message status enum
enum MessageStatus {
  Sent = "sent",
  Delivered = "delivered",
  Read = "read"
}

// Define the schema
const MessageSchema = new Schema(
  {
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false
  }
);

// Index for efficient retrieval of messages in a conversation (pagination)
MessageSchema.index({ conversationId: 1, createdAt: 1 });

// Index for efficient querying by sender
MessageSchema.index({ senderId: 1 });

// Index for efficient querying by status
MessageSchema.index({ status: 1 });

// Define the TypeScript types
export interface IMessageDocument extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type IMessage = InferSchemaType<typeof MessageSchema>;

// Create and export the model
export const Message: Model<IMessage> = mongoose.models.Message || 
  mongoose.model<IMessage>("Message", MessageSchema);