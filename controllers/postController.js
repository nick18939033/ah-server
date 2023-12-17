import asyncHandler from "express-async-handler";
import Post from "../models/postModel.js";
import User from "../models/userModal.js";
import Notification from "../models/notificationModel.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { image, desc, email } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  try {
    const post = new Post({
      id: user.id,
      profilePic: user.profilePic,
      desc,
      std: user.std,
      image,
      userId: user._id,
    });
    const eventEmmiter = req.app.get("eventEmmiter");
    const createdPost = await post.save();
    console.log(createdPost);
    eventEmmiter.emit("posted", {
      post: createdPost,
    });

    res.status(201).json(createPost);

    if (desc.match(/@\w+/g)) {
      const mentionsWithAt = desc.match(/@\w+/g);
      const mentionsWithoutAt = mentionsWithAt.map((mention) =>
        mention.slice(1)
      );
      const user = await User.findOne({ id: mentionsWithoutAt });
      const notification = new Notification({
        userId: user._id,
        profilePic: createdPost.profilePic,
        liked: false,
        replied: false,
        mention: true,
        id: createdPost.id,
        postId: createdPost._id,
        postImage: createdPost.image,
        reaction: createdPost.desc,
      });
      const createdNotification = await notification.save();
    }
  } catch (error) {
    console.log(error);
  }
});
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRandomPost = async (req, res) => {
  try {
    const randomPost = await Post.aggregate([{ $sample: { size: 1 } }]);
    res.status(200).json(randomPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if(post){
      res.status(200).json(post);
    }else{
    res.status(404).json({ message: "Something went wraang" });

    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    await post.remove();
    eventEmmiter.emit("posted", {
      post: post,
      delete: true,
    });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const likePost = asyncHandler(async (req, res) => {
  const { like } = req.body;
  const user = await User.findById(like);
  const post = await Post.findById(req.params.id);
  const notifications = await Notification.find();

  // console.log(notifications);
  if (post) {
    try {
      const isLiked = post.likes.find((x) => x.like == like);
      post.likes.find((x) => console.log(x.like, like));
      if (isLiked) {
        const objWithIdIndex = post.likes.findIndex((obj) => obj.like == like);
        post.likes.splice(objWithIdIndex, 1);
        const eventEmmiter = req.app.get("eventEmmiter");
        eventEmmiter.emit("liked", { like, islike: false, post });
        const updatedpost = await post.save();
        res.json(updatedpost);
      } else {
        post.likes.push(req.body);
        const eventEmmiter = req.app.get("eventEmmiter");
        eventEmmiter.emit("liked", { like, islike: true, post });
        const updatedpost = await post.save();

        const existsNot = notifications.some(
          (notification) =>
            notification.desc == post.desc && notification.postId == post._id
        );
        if (!existsNot) {
          const newNotification = new Notification({
            userId: post.userId,
            profilePic: user.profilePic,
            liked: true,
            replied:false,
            mention:false,
            id: user.id,
            desc: post.desc,
            postId: post._id,
            postImage: post.image,
          });

          await newNotification.save();
        }

        res.json(updatedpost);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const reactToPost = asyncHandler(async (req, res) => {
  const { reaction } = req.body;
  console.log(reaction);
  const post = await Post.findById(req.params.id);
  console.log(post);
  if (post) {
    post.reactions.push(reaction);
    const eventEmmiter = req.app.get("eventEmmiter");
    eventEmmiter.emit("reacted", { post, reaction });
    const updatedpost = await post.save();
    res.json(updatedpost);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

export { createPost, likePost, deletePost, reactToPost };
