module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  console.log(error.message);
  //checking if error is validation error
  if (error.isJoi)
    return res.json({
      success: false,
      message: error.message,
    });

  return res.status(error.statusCode).render("error", {
    status: error.statusCode,
    message: error.message,
  });
};
