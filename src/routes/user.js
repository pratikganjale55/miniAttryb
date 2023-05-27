const dotenv = require("dotenv");
dotenv.config();
const Router = require("express");
const authRoute = Router();
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel.js");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const handlebars = require("handlebars");
const fs = require("fs");

const path = require("path");
const { v4: uuidv4 } = require("uuid");
 
// signup //
authRoute.post("/signup", async (req, res) => {
  try {
    const userMail = await userModel.findOne({ email: req.body.email });
    const { name, email, password, rePassword } = req.body;
    const uuid = uuidv4();
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if (!name) {
      return res.send({ message: "enter user name" });
    }
    if (userMail) {
      return res.send({ message: "user already registered" });
    }
    if (password !== rePassword) {
      return res
        .status(400)
        .send({ message: "Please make sure your passwords match." });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        message:
          "Password must contain at least 8 characters, including at least 1 number, 1 lowercase letter, and 1 uppercase letter.",
      });
    }

    if (!emailReg.test(email)) {
      return res
        .status(400)
        .send({ message: "Please provide a valid email address." });
    }

    const salt = await bcrypt.genSaltSync(10);
    const Pass = await bcrypt.hash(req.body.password, salt);
    const rePass = await bcrypt.hash(req.body.rePassword, salt);

    const user = new userModel({
      ...req.body,
      password: Pass,
      rePassword: rePass,
      uuid,
    });

    const result = await user.save();
    const directory = path.join(__dirname, "..","..", "utils", "signupEmail.html");
    const fileRead = fs.readFileSync(directory, "utf-8");
    const template = handlebars.compile(fileRead);
    const htmlToSend = template({ name: req.body.name, userId: uuid });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Signup Successfully",
      html: htmlToSend,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("error sending mail", { err });
        return res.status(500).send({ message: "Error sending email" });
      }
      console.log("successfully signed up");
      return res
        .status(200)
        .send({ message: "successfully signup with email" });
    });
  } catch (err) {
    console.log("error occurred", { error: err });
    return res.status(500).send({ message: "error occurred", err });
  }
});

//email confirmation
authRoute.patch("/emailConfirm/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findOneAndUpdate(
      { uuid: id },
      { $set: { emailConfirmed: true } }
    );
    user.save();
    console.log("Email verification successs");
    return res.status(201).send({ message: "Email verification successs" });
  } catch (error) {
    console.log("email not verified", { error });
    return res.status(401).send({ message: "Email not verified" });
  }
});

// login //
authRoute.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const validUser = await userModel.findOne({ email });
  console.log(validUser);

  if (!email || !password) {
    return res.status(422).send({ message: "fill all the details" });
  }

  if (!validUser) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  if (!validUser.emailConfirmed) {
    return res
      .status(401)
      .send({ message: "Please confirm your email before logging in" });
  }

  const isMatch = await bcrypt.compare(password, validUser.password);

  if (!isMatch) {
    return res.status(401).send({ message: "Invalid Credentials" });
  }

  // authorize based on user role
  const token = jwt.sign(
    {
      email: validUser.email,
      userId : validUser._id
    },
    process.env.JWT_KEY
  );

  // cookiegenerate
  res.cookie("usercookieAuth", token, {
    expires: new Date(Date.now() + 9000000),
    httpOnly: true,
  });
  console.log("login successful");
  res.status(201).send({
    message: "Login successful",
    userDetails: {
      token,
      userName: validUser.name,
      id: validUser._id
     
    },
  });
});





module.exports = authRoute;
