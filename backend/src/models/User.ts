import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  university: string;
  universityDomain: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  profilePicture?: string;
  bio?: string;
  yearInSchool?: string;
  major?: string;
  listings?: mongoose.Types.ObjectId[];
  swaps?: mongoose.Types.ObjectId[];
  savedListings?: Array<{
    listing: mongoose.Types.ObjectId;
    savedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /\.edu$/i.test(v);
        },
        message: 'Email must be a valid .edu address'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      trim: true
    },
    universityDomain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },
    profilePicture: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    yearInSchool: {
      type: String,
      enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'PhD'],
      default: null
    },
    major: {
      type: String,
      maxlength: [100, 'Major cannot exceed 100 characters'],
      default: null
    },
    listings: [{
      type: Schema.Types.ObjectId,
      ref: 'Listing'
    }],
    swaps: [{
      type: Schema.Types.ObjectId,
      ref: 'Swap'
    }],
    savedListings: [{
      listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
      },
      savedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

userSchema.index({ email: 1 });
userSchema.index({ university: 1 });
userSchema.index({ emailVerified: 1 });

const User = mongoose.model<IUser>('User', userSchema);

export default User;