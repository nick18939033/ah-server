import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import postRoutes from "./routes/postRoutes.js";
import userRoute from "./routes/userRoute.js";
import reactionRoute from "./routes/reactionRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Emmiter from "events";
dotenv.config();

connectDB();

const app = express();
app.use(cors());

app.use(bodyParser.json());

const eventEmmiter = new Emmiter();
app.set("eventEmmiter", eventEmmiter);
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoute);
app.use("/api/react", reactionRoute);
app.use("/api/notification", notificationRoute);

app.get("/", (req, res) => {
  res.send("Api is Running");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://meatloo.com",
      "http://localhost:3000",
      "http://192.168.1.207:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    console.log("data"+data);
    socket.join(data);
  });

});

eventEmmiter.on("followerAdded", (data) => {
  io.to(`follower_${data.user.id}`).emit("followerAdded", data);
});

eventEmmiter.on("liked", (data) => {
  io.to(`post_${data.post._id}`).emit("liked", data);
});

eventEmmiter.on("reacted", (data) => {
  io.to(`post_${data.post._id}`).emit("reacted", data);
});

eventEmmiter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmmiter.on("productUpdated", (data) => {
  io.to(`product_${data.id}`).emit("productUpdated", data);
});

eventEmmiter.on("posted", (data) => {
  io.to("broadcast").emit("posted", data);
  console.log("123456789"+data.post);
});

eventEmmiter.on("shopUpdated", (data) => {
  io.to("broadcastShop").emit("shopUpdated", data);
  console.log("Shop Status Updated");
});

eventEmmiter.on("deletedProduct", (data) => {
  io.to("broadcastDeleteProduct").emit("deletedProduct", data);
});

httpServer.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
