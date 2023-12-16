import mongoose from "mongoose";
import Post from "./postModel.js";
import Reaction from "./reactionsModal.js";
import Notification from "./notificationModel.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    id: {
      unique: true,
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    oldId: {
      type: String,
    },
    oldPf: {
      type: String,
    },
    oldstd: {
      type: String,
    },
    email: {
      unique: true,
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    std: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
    },
    friends: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);
UserSchema.post("findOneAndUpdate", async function (result) {
  if (result) {
    try {
      const { id, oldId, profilePic, std } = result;
      console.log("!%^&*()" + oldId);
      await Post.updateMany(
        { id: oldId || id }, // Match posts where the user id is the old id
        {
          $set: {
            id: id,
            profilePic: profilePic,
            std: std,
          },
        }
      );
      await Reaction.updateMany(
        { id: oldId || id }, // Match posts where the user id is the old id
        {
          $set: {
            id: id,
            profilePic: profilePic,
            std: std,
          },
        }
      );
      await Notification.updateMany(
        { id: oldId || id }, // Match posts where the user id is the old id
        {
          $set: {
            id: id,
            profilePic: profilePic,
            std: std,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
});

const User = mongoose.model("User", UserSchema);
export default User;
