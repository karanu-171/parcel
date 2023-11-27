const { pool } = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const smtpTransport = require("nodemailer-smtp-transport");
const generateToken = require("../../utils/generateToken");
const {
  userRegistrationSchema,
  userLoginSchema,
  userIdSchema,
  userUpdateSchema,
} = require("../../helpers/user/user");

// Function to hash a password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const registerUser = async (req, res) => {
  const { userName, email, phoneNumber, password } = req.body;
  // Validate the request body using Joi schema
  const { error } = userRegistrationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Check if the user already exists
    const existingUser = await conn.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      conn.release();
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into the user table
    try {
      const result = await conn.query(
        "INSERT INTO user (userType, userName, email, phoneNumber, password) VALUES (?, ?, ?, ?, ?)",
        ["user", userName, email, phoneNumber, hashedPassword]
      );

      // Check if the query executed successfully and affected any rows
      if (result.affectedRows > 0) {
        // Generate and include a token
        const token = generateToken(result.id);
        // Fetch the user object
        const [user] = await conn.query("SELECT * FROM user WHERE id = ?", [
          result.insertId,
        ]);

        conn.release();

        return res.status(200).json({ user, token });
      } else {
        conn.release();
        return res.status(500).json({ message: "Failed to register user" });
      }
    } catch (err) {
      // Handle any errors related to the query execution
      console.error(err);
      conn.release();
      return res.status(500).json({ message: "Error inserting user" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate the request body using Joi schema
  const { error } = userLoginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Check if the user exists with the provided email
    const [user] = await conn.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    conn.release();

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password from the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // User is authenticated, generate a token
    const token = generateToken(user.id);

    return res.status(200).json({ user, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOneUser = async (req, res) => {
  const id = req.params.id; // Get the user ID from the URL

  // Validate the id using Joi schema
  const { error } = userIdSchema.validate(id);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Execute the SQL query to get the user by ID
    const [user] = await conn.query("SELECT * FROM user WHERE id = ?", [id]);

    conn.release(); // Release the connection

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllUser = async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Retrieve all users from the user_account table
    const users = await conn.query("SELECT * FROM user");

    conn.release();

    // Send the users as a JSON response
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  const id = req.params.id; // Get the user ID from the URL
  const { userName, email, password, phoneNumber } = req.body;

  // Validate the request body against the schema
  const { error } = userUpdateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Establish a database connection
    const conn = await pool.getConnection();
    // Hash the password before including it in the SQL query
    const hashedPassword = await hashPassword(password);

    // Execute the SQL query to update the user by ID
    const query =
      "UPDATE user SET email = ?, password = ?,  userName = ?,  phoneNumber = ? WHERE id = ?";
    const queryResult = await conn.query(query, [
      email,
      hashedPassword,
      userName,
      phoneNumber,
      id,
    ]);

    conn.release(); // Release the connection

    if (queryResult && queryResult.affectedRows > 0) {
      // Fetch the updated user object
      const updatedUser = await conn.query("SELECT * FROM user WHERE id = ?", [
        id,
      ]);

      const result = {
        message: "User updated successfully",
        user: updatedUser[0],
      };
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const id = req.params.id; // Get the user ID from the URL

  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Execute the SQL query to delete the user by ID
    const query = "DELETE FROM user WHERE id = ?";
    const queryResult = await conn.query(query, [id]);

    conn.release(); // Release the connection

    if (queryResult && queryResult.affectedRows > 0) {
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Check if the user with the provided email exists
    const [user] = await conn.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    conn.release(); // Release the connection

    if (user.length === 0) {
      return res.status(404).json({ Status: "User does not exist" });
    }

    const userId = user.id;

    // Generate a token for password reset
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Create a password reset link
    const front = process.env.FRONT_URL;
    const resetLink = `${front}/auth/reset/${userId}/${token}`;

    // Create an email transport
    const transporter = nodemailer.createTransport({
      host: process.env.HOSTS,
      port: process.env.PORTS,
      secure: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASS,
      },
    });
    
    // Compose the email
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Reset Password Link",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return res.json({ Status: "Success", info });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Status: "Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getOneUser,
  getAllUser,
  updateUser,
  deleteUser,
  forgotPassword,
};
