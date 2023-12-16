import Notification from "../models/notificationModel.js";
import Reaction from "../models/reactionsModal.js";

export const createNotification = async (req, res) => {
  try {
    const { notification_ } = req.body;
    console.log(notification_);
    const notification = new Notification({
      userId: notification_.userId,
      profilePic: notification_.profilePic,
      liked: notification_.liked,
      id: notification_.id,
      postId: notification_.postId,
      postImage: notification_.postImage,
      reaction: notification_.reaction,
    });
    const createdNotification = await notification.save();
    // const eventEmmiter = req.app.get("eventEmmiter");
    // eventEmmiter.emit("reacted", { reaction: createdNotification });
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(404)
    console.log(error);
  }
}

export const getNotifications = async (req, res) => {
  console.log(req.params.id);
  const notification = await Notification.find({ userId:req.params.id });
  if (notification) {
    res.json(notification);
  } else {
    res.status(404).json({ mssg: "Notification Not Found" });
  }
}
