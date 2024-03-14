module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (error.statusCode == 404) console.log(error.message, "\npath:", req.path);
  console.log(error);
  res.status(error.statusCode).render("error", {
    status: error.statusCode,
    message: error.message,
  });
};
