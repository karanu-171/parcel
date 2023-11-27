const { pool } = require("../../config/db");
const {
  parcelCreationSchema,
  parcelIdSchema,
  parcelUpdateSchema
} = require("../../helpers/parcel/parcel");

const calculatePrice = (weight) => {
  // Define your pricing logic here, e.g., $X per kg.
  const pricePerKg = 100; // Example price per kg

  // Calculate the price based on the weight
  return pricePerKg * weight;
};

const createParcel = async (req, res) => {
  const {
    description,
    senderName,
    receiverName,
    senderNumber,
    receiverNumber,
    startLocation,
    endLocation,
    weight,
  } = req.body;
  // Validate the request data using the Joi schema
  const { error } = parcelCreationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // Calculate the price based on the weight
  const price = calculatePrice(weight);

  // Extract the userId from req.user
  const { id: userId } = req.user;
  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Insert the new parcel into the parcel table
    const query =
      "INSERT INTO parcel (userId, description, senderName, receiverName, senderNumber, receiverNumber, startLocation, endLocation, weight, price, isSent, isDelivered, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const queryResult = await conn.query(query, [
      userId,
      description,
      senderName,
      receiverName,
      senderNumber,
      receiverNumber,
      startLocation,
      endLocation,
      weight,
      price, // Set the calculated price here
      false, // Set other fields as needed
      false,
      new Date(),
    ]);

    conn.release(); // Release the connection

    if (queryResult && queryResult.affectedRows > 0) {
      // Fetch the newly created parcel object
      const [createdParcel] = await conn.query(
        "SELECT * FROM parcel WHERE id = ?",
        [queryResult.insertId]
      );

      conn.release(); // Release the connection

      return res.status(201).json({
        message: "Parcel created successfully",
        parcel: createdParcel,
      });
    } else {
      conn.release(); // Release the connection
      return res.status(500).json({ message: "Failed to create parcel" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getOneParcel = async (req, res) => {
  const id = req.params.id; // Get the parcel ID from the request parameters

  // Validate the id using the Joi schema
  const { error } = parcelIdSchema.validate(id);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Query the database to retrieve the parcel by its ID
    const [parcel] = await conn.query("SELECT * FROM parcel WHERE id = ?", [
      id,
    ]);

    conn.release(); // Release the connection

    if (!parcel || parcel.length === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Return the retrieved parcel in the response
    return res.status(200).json({ parcel });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllParcel = async (req, res) => {
  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Query the database to retrieve all parcels
    const parcels = await conn.query("SELECT * FROM parcel");

    conn.release(); // Release the connection

    // Return the retrieved parcels in the response
    return res.status(200).json({ parcels });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateParcel = async (req, res) => {
    const parcelId = req.params.id; // Get the parcel ID from the URL
    const {
      description,
      senderName,
      receiverName,
      senderNumber,
      receiverNumber,
      startLocation,
      endLocation,
      weight,
    } = req.body;

    // Validate the request data using the Joi schema
    const { error } = parcelUpdateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Calculate the price based on the weight
    const price = calculatePrice(weight);

    try {
      // Establish a database connection
      const conn = await pool.getConnection();

      // Execute the SQL query to update the parcel by its ID
      const query =
        "UPDATE parcel SET description = ?, senderName = ?, receiverName = ?, senderNumber = ?, receiverNumber = ?, startLocation = ?, endLocation = ?, weight = ?, price = ? WHERE id = ?";
      const queryResult = await conn.query(query, [
        description,
        senderName,
        receiverName,
        senderNumber,
        receiverNumber,
        startLocation,
        endLocation,
        weight,
        price, // Set the calculated price here
        parcelId,
      ]);

      conn.release(); // Release the connection

      if (queryResult && queryResult.affectedRows > 0) {
        // Fetch the updated parcel object
        const [updatedParcel] = await conn.query(
          "SELECT * FROM parcel WHERE id = ?",
          [parcelId]
        );

        return res.status(200).json({
          message: "Parcel updated successfully",
          parcel: updatedParcel,
        });
      } else {
        return res.status(404).json({ message: "Parcel not found" });
      }
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};
const deleteParcel = async (req, res) => {
  const id = req.params.id; // Get the parcel ID from the URL

  try {
    // Establish a database connection
    const conn = await pool.getConnection();

    // Execute the SQL query to delete the parcel by its ID
    const query = "DELETE FROM parcel WHERE id = ?";
    const queryResult = await conn.query(query, [id]);

    conn.release(); // Release the connection

    if (queryResult && queryResult.affectedRows > 0) {
      return res.status(200).json({ message: "Parcel deleted successfully" });
    } else {
      return res.status(404).json({ message: "Parcel not found" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createParcel,
  getOneParcel,
  getAllParcel,
  updateParcel,
  deleteParcel,
};
