const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (user, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
    },
  );

  res.cookie("jwt", token, {
    maxAge: Number(env.cookies.cookieExpiresIn) * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: env.nodeEnv !== "development",
  });

  return token;
};

module.exports = generateToken;
