import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  listingId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  },
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date
  },
  unreadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ listingId: 1 });

// Ensure only two participants and no duplicates
ConversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('Conversation must have exactly 2 participants'));
  } else if (this.participants[0].equals(this.participants[1])) {
    next(new Error('Cannot create conversation with same user'));
  } else {
    next();
  }
});

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;