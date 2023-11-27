const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { pool } = require("./config/db");
const userRoutes = require("./routes/user/userRoutes");
const parcelRoutes = require("./routes/parcel/parcelRoutes");
// connection to db
pool;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

dotenv.config();
//userRoutes
app.use("/api/users", userRoutes);
app.use("/api/parcels", parcelRoutes);

const port = process.env.PORT || 4500;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
