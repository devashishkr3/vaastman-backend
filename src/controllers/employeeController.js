const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");

/**---------------------EMPLOYEE-DASHBOARD--------------------- */
exports.dashboard = async (req, res, next) => {
  res.send("Dashboard");
};
