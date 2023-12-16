import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    profilePic: {
      type: String,
    },
    id: {
      type: String,
    },
    liked: {
      type: Boolean,
    },
    replied: {
      type: Boolean,
    },
    mention: {
      type: Boolean,
    },
    postImage: {
      type: String,
    },
    reaction: {
      type: String,
    },
    userId: {
      type: String,
    },
    postId: {
      type: String,
    },
    desc: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notifications", notificationSchema);

export default Notification;
