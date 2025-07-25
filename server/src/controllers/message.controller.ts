import { Request, Response } from 'express';
import User from '../models/user.model';
import Message from '../models/message.model';
import cloudinary from '../lib/cloudinary';

export const getUsersForSideBar = async (req: any, res: Response): Promise<void> => {
  try {
    const loggedinUserId = req.user._id;
    const filteredUsers = await User.find({_id: {$ne:loggedinUserId}}).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    const err = error as Error;
    console.error("Error in getUsersForSidebar: ", err.message);
    res.status(500).json({error: "Internal server error"});
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: gameroomId } = req.params;
    //const myId = req.user._id;

    const messages = await Message.find({ gameroomId: gameroomId })
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json(messages);
  } catch (error) {
    const err = error as Error;
    console.error("Error in getMessages: ", err.message);
    res.status(500).json({error: "Internal server error"});
  }
};

export const sendMessage = async (req: any, res:Response) => {
  try {
    const { text, image } = req.body;
    const { id: gameroomId } = req.params;
    const sender = req.user._id;

    if (!text && !image) {
      res.status(400).json({ message: "Message must contain text or image." });
      return;
    }

    let imageURL;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      sender,
      gameroomId,
      ...(text && { text }),
      ...(imageURL && { image: imageURL }),
    });

    await newMessage.save();
    // todo: realtime functionality with socket.io
    res.status(201).json(newMessage);
  } catch (error) {
    const err = error as Error;
    console.error("Error in sendMessage: ", err.message);
    res.status(500).json({error: "Internal server error"});
  }
}