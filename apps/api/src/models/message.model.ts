import mongoose, {
  Schema,
  type InferSchemaType,
  type Model
} from "mongoose";

// ---- ENUMS ---- //

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system"
}

export enum DeliveryStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read"
}

// ---- SCHEMA ---- //

const MessageSchema = new Schema(
  {
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

    // Core content (encrypted)
    content: {
      type: String,
      trim: true,
      maxlength: 5000
    },

    // Initialization Vector for AES-256-CBC encryption
    iv: {
      type: String,
      required: false  // false for backward compatibility with existing messages
    },

    // Message type
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
      required: true
    },

    // For media / files / extensibility
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true }, // image, video, file
        name: { type: String },
        size: { type: Number },
        format: { type: String }
      }
    ],
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
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// ---- INDEXES ---- //

// 🔥 Critical for chat performance
MessageSchema.index({ conversationId: 1, sequence: -1 });

// 🔥 Fallback ordering
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// 🔥 Deduplication
MessageSchema.index({ clientId: 1 }, { sparse: true });

// 🔥 Partial index (ignore deleted)
MessageSchema.index(
  { conversationId: 1, sequence: -1 },
  { partialFilterExpression: { isDeleted: false } }
);

// ---- TYPES ---- //

export type IMessage = InferSchemaType<typeof MessageSchema>;

export const Message: Model<IMessage> =
  mongoose.models.Message as Model<IMessage> ||
  mongoose.model<IMessage>("Message", MessageSchema);