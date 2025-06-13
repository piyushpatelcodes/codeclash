import  { Schema, model, models, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'labtester' | 'sales' | 'finance';
  authority: Types.ObjectId | IUser; // Reference to another user (authority)
  // sharedWith?: Types.ObjectId[];
  domainOwner: boolean; // Flag to mark the first admin of a domain
  domain: string;
  accountStatus?: 'active' | 'suspended' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'labtester', 'sales' , 'finance'],
      default: 'sales',
      required: true,
    },
    authority: {
      type: String,  
      required: function (this: IUser) {
        return this.role !== 'superadmin';  // superadmin has no authority
      },
      validate: {
        validator: function (value) {
          // Validate that the authority field is either a valid ObjectId or a valid temp ID format
          const tempIdPattern = /^tempid\d+$/;    // Ensure it matches "tempidXXXX"
          return Types.ObjectId.isValid(value) || tempIdPattern.test(value);
        },
        message: 'Invalid authority ID format. It must be either an ObjectId or a temporary ID (e.g. tempidXXXX)',
      },
    },
    domainOwner: {
      type: Boolean,
      default: false, // First user from a domain will be the owner
    },
    domain: {
      type: String,
      required: true, // To track the domain for a user
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      required:true,
    },
    // sharedWith: {
    //   type: [Schema.Types.ObjectId],
    //   ref: 'User', // Track testers who have access to reports from this salesperson
    // },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔐 Hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// 🔁 Virtual: users under an authority
userSchema.virtual('team', {
  ref: 'User',
  localField: '_id',
  foreignField: 'authority',
  justOne: false,
});


const User = models?.User || model<IUser>("User", userSchema);

export default User;