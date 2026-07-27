const jwt = require("jsonwebtoken");

const generateToken = (user, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
    },
  );

  res.cookie("jwt", token, {
    maxAge: Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

module.exports = generateToken;
