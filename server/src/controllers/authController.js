
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Password: 8–16 characters, at least one uppercase
// letter and at least one special character.
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    // Validate field types before using string methods.
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof address !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !address.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required and must be valid strings",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedAddress = address.trim();

    if (
      normalizedName.length < 20 ||
      normalizedName.length > 60
    ) {
      return res.status(400).json({
        message: "Name must be between 20 and 60 characters",
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    if (normalizedAddress.length > 400) {
      return res.status(400).json({
        message: "Address cannot exceed 400 characters",
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters with at least one uppercase letter and one special character",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Public registration always creates a normal user.
    // Never accept a role from the request body.
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      address: normalizedAddress,
      password: hashedPassword,
      role: "user",
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // Use the same message for unknown emails and wrong passwords.
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};
