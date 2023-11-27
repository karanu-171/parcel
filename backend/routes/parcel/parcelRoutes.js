const express = require("express");
const {
  createParcel,
  getOneParcel,
  getAllParcel,
  updateParcel,
  deleteParcel,
} = require("../../controllers/parcel/parcelController.js");

const { protect, restrict } = require("../../middleware/auth.js");

const parcelRoutes = express.Router();

parcelRoutes.post("/save", protect, createParcel);
parcelRoutes.get("/:id", protect, getOneParcel);
parcelRoutes.get("/", protect, getAllParcel);
parcelRoutes.put("/update/:id", protect, updateParcel);
parcelRoutes.delete("/delete/:id", protect, deleteParcel);

module.exports = parcelRoutes;
