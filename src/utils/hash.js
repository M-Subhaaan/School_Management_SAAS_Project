const crypto = require("crypto");

const hashValue = (value) => {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
};

module.exports = hashValue;
