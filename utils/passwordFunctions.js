const bcrypt = require("bcrypt");

//function that hashes the password
exports.securePswd = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log(error.message);
  }
};
