const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const registerMail = require("../helpers/register-mail");

const register = async (req, res, next) => {
  

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    role,
    organizationName,
    address,
    phone,
    email,
    password,
    latitude,
    longitude,
  } = req.body;
 
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User already exists! Please login instead.",
      422
    );

    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not register, please try again.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    role,
    organizationName,
    password: hashedPassword,
    phone,
    address,
    email,
    latitude,
    longitude,
  });

  try {
    console.log(createdUser);
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  registerMail(createdUser);

  res.status(201).json({success: true,
    userId: createdUser.id,
  });
};

const login = async (req, res, next) => {
 

  const { role, email, password } = req.body;

 
  if (!role || !email || !password) {
    const error = new HttpError(
      "Please provide all required fields: role, email, and password.",
      400
    );
    return next(error);
  }

  let existingUser;
  try {
    
    existingUser = await User.findOne({ email: email, role: role });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

 
  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials or role, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
   
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }


  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let token;
  try {
  
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "2h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  
  res.json({
    success: true,
    userId: existingUser.id,
    email: existingUser.email,
    role: existingUser.role,
    token: token,
    organizationName: existingUser.organizationName,
  });
};

exports.register = register;
exports.login = login;
