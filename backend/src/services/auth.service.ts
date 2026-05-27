import User, { IUser } from "../models/User.model";
import { generateToken } from "../utils/jwt.utils";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import crypto from "crypto";

// ─── What gets returned after register/login ──────────────────────
interface AuthResult {
  user: Partial<IUser>;
  token: string;
}

// ─── Helper: strip sensitive fields before sending user to frontend ─
const sanitizeUser = (user: IUser): Partial<IUser> => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    addresses: user.addresses,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
};

// ─── REGISTER ─────────────────────────────────────────────────────
export const registerService = async (
  data: RegisterInput
): Promise<AuthResult> => {
  const { name, email, password, phone } = data;

  // 1. Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("Email already registered") as Error & {
      statusCode: number;
    };
    error.statusCode = 409; // 409 Conflict
    throw error;
  }

  // 2. Create user — password gets hashed automatically by User.model pre-save hook
  const user = await User.create({ name, email, password, phone });

  // 3. Generate JWT
  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// ─── LOGIN ────────────────────────────────────────────────────────
export const loginService = async (
  data: LoginInput
): Promise<AuthResult> => {
  const { email, password } = data;

  // 1. Find user by email — we need password so we explicitly select it
  //    (password has select:false in the model so it's excluded by default)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode: number;
    };
    error.statusCode = 401;
    throw error;
    // NOTE: we say "Invalid email or password" not "Email not found"
    // This prevents attackers from knowing which emails are registered
  }

  // 2. Check if account is active
  if (!user.isActive) {
    const error = new Error(
      "Your account has been deactivated. Please contact support"
    ) as Error & { statusCode: number };
    error.statusCode = 403;
    throw error;
  }

  // 3. Compare entered password with hashed password in DB
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password") as Error & {
      statusCode: number;
    };
    error.statusCode = 401;
    throw error;
  }

  // 4. Generate JWT
  const token = generateToken(user);

  return { user: sanitizeUser(user), token };
};

// ─── GET PROFILE ──────────────────────────────────────────────────
export const getProfileService = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }
  return user;
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────
export const updateProfileService = async (
  userId: string,
  data: { name?: string; phone?: string; avatar?: string }
): Promise<IUser> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    {
      new: true,      // return updated document
      runValidators: true, // run schema validators on update
    }
  );

  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  return user;
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────
export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // Must select password explicitly since it's hidden by default
  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  // Verify current password before allowing change
  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) {
    const error = new Error("Current password is incorrect") as Error & {
      statusCode: number;
    };
    error.statusCode = 401;
    throw error;
  }

  // Assign new password — pre-save hook will hash it automatically
  user.password = newPassword;
  await user.save();
};

// ─── ADD ADDRESS ──────────────────────────────────────────────────
export const addAddressService = async (
  userId: string,
  addressData: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    isDefault?: boolean;
  }
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  // If new address is default, unset all other defaults first
  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default automatically
  if (user.addresses.length === 0) {
    addressData.isDefault = true;
  }

  user.addresses.push(addressData as any);
  await user.save();
  return user;
};

// ─── DELETE ADDRESS ───────────────────────────────────────────────
export const deleteAddressService = async (
  userId: string,
  addressId: string
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  const addressIndex = user.addresses.findIndex(
    (addr) => addr._id?.toString() === addressId
  );

  if (addressIndex === -1) {
    const error = new Error("Address not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();
  return user;
};