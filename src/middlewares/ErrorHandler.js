const errorHandler = (err, req, res, next) => {
  
  if (err instanceof ApiError) {
    return res.status(err.statuscode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }

  
  console.error("Unexpected Error:", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
};

export { errorHandler };