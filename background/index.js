const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { pool } = require("./config/db");

// connection to db
pool;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`background service running on port ${port}`);
});
