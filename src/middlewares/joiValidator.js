const AppError = require("../utils/error");

module.exports = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return next(new AppError(messages.join(", "), 400));
    }

    next();
  };
};
