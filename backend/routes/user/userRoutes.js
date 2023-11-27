const express = require("express");
const {
  registerUser,
  loginUser,
  getOneUser,
  getAllUser,
  updateUser,
  deleteUser,
  forgotPassword
} = require("../../controllers/users/userController");

const { protect } = require("../../middleware/auth.js");

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/:id", protect, getOneUser);
userRoutes.get("/", protect, getAllUser);
userRoutes.put("/update/:id", protect, updateUser);
userRoutes.delete("/delete/:id", protect, deleteUser);
userRoutes.post("/forgot", forgotPassword);


module.exports = userRoutes;
