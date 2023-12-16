import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      ref: "User",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    profilePic: {
      type: String,
    },
    std: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    likes: [],
    desc: {
      type: String,
      required: true,
    },
    reactions:[]
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Posts", postSchema);

export default Post;
