import User from "../models/userModal.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generateToken from "../middleware/generateToken.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const { email, password, id, name, std, profilePic } = req.body;
    console.log("porfilepicc " + profilePic);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.findOne({ email });
    const userEmail = await User.findOne({ email: email });
    if (userEmail) res.json({ error: "Email Already Exist" });
    const userid = await User.findOne({ id: id });
    if (userid) res.json({ error: "Id Already Exist" });
    if (!user) {
      const user = await User.create({
        email,
        password,
        id,
        name,
        std,
        profilePic,
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          id: user.id,
          email: user.email,
          password: user.password,
          std: user.std,
          profilePic: user.profilePic,
          token: generateToken(user._id),
        });
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email: email });
    console.log(user);

    if (!user) return res.status(400).json({ msg: "User does not exist. " });
    const isMatch = user.password === password;
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.json({
      _id: user._id,
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      std: user.std,
      profilePic: user.profilePic,
      followers: user.followers,
      followings: user.followings,
      bio: user.bio,
      token: token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
};

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

export const getUserFollower = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const followers = await Promise.all(
      user.followers.map((id) => User.findById(id))
    );
    const formattedfollowers = followers.map(({ _id, id, std, profilePic }) => {
      return { _id, std, id, profilePic };
    });
    res.status(200).json(formattedfollowers);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUser } = req.body;
    const user = await User.findById(id);
    const follower = await User.findById(followUser._id);
    const existUser = follower?.followings?.find(
      (follow) => follow.id == user.id
    );

    if (
      user.followers.find((user) => user._id == followUser._id) &&
      existUser != null
    ) {
      user.followers = user.followers.filter(
        (user) => user._id !== followUser._id
      );
      follower.followings = follower.followings.filter(
        (follow) => follow._id !== user._id
      );
      const eventEmmiter = req.app.get("eventEmmiter");
      eventEmmiter.emit("followerAdded", { followUser, user, follow: false });
    } else {
      user.followers.push(followUser);
      follower.followings.push(user);

      const eventEmmiter = req.app.get("eventEmmiter");
      eventEmmiter.emit("followerAdded", { followUser, user, follow: true });
    }
    await user.save();
    await follower.save();

    const followers = await Promise.all(
      user.followers.map((id) => User.findById(id))
    );
    const formattedfollowers = followers.map(({ _id, id, std, profilePic }) => {
      return { _id, std, id, profilePic };
    });

    res.status(200).json(formattedfollowers);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addRemoveFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUser } = req.body;
    const user = await User.findById(id);
    const friend = await User.findById(followUser._id);

    if (user.friends.find((user) => user._id == followUser._id)) {
      user.friends = user.friends.filter((user) => user._id !== followUser._id);

      friend.friends = user.friends.filter(
        (user) => user._id !== followUser._id
      );

      const eventEmmiter = req.app.get("eventEmmiter");
      eventEmmiter.emit("followerAdded", { followUser, user, follow: false });
    } else {
      user.friends.push(followUser);
      friend.friends.push(user);
      const eventEmmiter = req.app.get("eventEmmiter");
      eventEmmiter.emit("followerAdded", { followUser, user, follow: true });
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      id: user.id,
      bio: user.bio,
      std: user.std,
      profilePic: user.profilePic,
    });
  } else {
    res.status(404).json("");
    throw new Error("User not found");
  }
};

export const getUserById = async (req, res) => {
  const user = await User.findOne({ id: req.params.id });

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      id: user.id,
      bio: user.bio,
      std: user.std,
      profilePic: user.profilePic,
    });
  } else {
    res.status(404).json({ mssg: "User Not Found" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id }, // Assuming your route includes the user ID as a parameter
      {
        $set: {
          name: req.body.name,
          id: req.body.id,
          oldId: req.body.oldId,
          oldPf: req.body.oldPf,
          oldstd: req.body.oldstd,
          std: req.body.std,
          bio: req.body.bio,
          profilePic: req.body.profilePic,
        },
      },
      { new: true, runValidators: true }
    );

    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log(error);
  }
};
