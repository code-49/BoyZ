exports.generateOTP = (length) => {
  const characters = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++)
    otp += characters.charAt(Math.floor(Math.random() * 10)); //10 is the characters length

  return otp;
};

exports.generateCouponCode = () => {
  const characters = "0123456789qwertyuiopasdfghjklzxcvbnm";
  let otp = "";

  for (let i = 0; i < 6; i++)
    otp += characters.charAt(Math.floor(Math.random() * characters.length)); //10 is the characters length

  return otp;
};
