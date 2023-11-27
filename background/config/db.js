const mariadb = require("mariadb");
const dotenv = require("dotenv");
dotenv.config();

// Create a pool
const pool = mariadb.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Log "Database connected"
console.log("Database connected");

const release = (conn) => {
  if (conn) {
    conn.release();
  }
};

module.exports = { pool, release };
