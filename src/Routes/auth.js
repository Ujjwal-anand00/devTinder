const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;
    // validation of data
    validateSignUpData(req);
    // Encrypt the password

    const passwordHash = await bcrypt.hash(password, 10);

    console.log(passwordHash);

    // creating new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.send("User added sucessfully !!!!");
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials!!");
    }

    const isPasswordIsValid = await user.validatePassword(password);

    if (isPasswordIsValid) {
      // create a JWT token

      const token = await user.getJWT();

      // Add JWT token to cookies and send the response to user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });

      res.send(user);
    } else {
      throw new Error("Invalid credentials!!");
    }
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
        // clear the cookies
        res.cookie("token",null, {
            expires: new Date(Date.now()),
        });
        res.send("Logout Successfully !!");
});

module.exports = authRouter;

