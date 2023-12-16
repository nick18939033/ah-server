import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addRemoveFollowing, getUserFollower, login, register,getUser, getUsers, getUserProfile, updateUserProfile, addRemoveFriend, getUserById } from "../controllers/userController.js";

const router = express.Router();

/* READ */
router.get("/id/:id", getUserById);
router.get("/", getUsers);
// router.get("/:id/followers", getUserFollower);

/* UPDATE */
router.patch("/:id",  addRemoveFriend);
// router.put("/:id",  updateUserRequest);
router.get("/:id",  getUserProfile);
router.patch("/:id/update",  updateUserProfile);
router.post("/login", login);
router.post("/register", register);
export default router;
