import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from "bcrypt";
import { generateToken } from '../lib/util';
import cloudinary from '../lib/cloudinary';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const validUsernameMessage = checkValidUsername(username);
    if (validUsernameMessage !== "") {
      res.status(400).json({ message: validUsernameMessage});
      return;
    }
    const user = await User.findOne({username});
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    })

    if (newUser){
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
      })

    } else {
      res.status(400).json({ message: "Invalid user data"});
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in signup controller:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const {username, password} = req.body;
    const user = await User.findOne({username});

    if (!user) {
      res.status(400).json({ message: "Invlaid credentials" });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invlaid credentials" });
      return;
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id:user._id,
      username: user.username,
      password: user.password,
    })
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in signup controller:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  try {
    res.cookie("jwt", "", {maxAge:0});
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in signup controller:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { username, profilePic } = req.body;
    const userId = req.user._id;

    if (!username && !profilePic) {
      res.status(400).json({ message: "No changes are being made" });
      return;
    }

    const updateFields: Record<string, any> = {};

    if (username) {
      updateFields.username = username;
    }

    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateFields.profilePic = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error in update profile:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req: any, res: Response): void => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    const err = error as Error;
    console.log("Error in checkAuth controller", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function checkValidUsername(username: string): string {
  if (!username) {
    return "Username is required.";
  }

  if (username.length < 3 || username.length > 12) {
    return "Username must be between 3 and 12 characters.";
  }

  if (!/^[a-zA-Z_]+$/.test(username)) {
    return "Username can only contain letters and underscores.";
  }

  if (!/[a-zA-Z]/.test(username)) {
    return "Username must contain at least one letter.";
  }

  return "";
}