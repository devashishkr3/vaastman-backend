const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");

/**---------------------EMPLOYEE-DASHBOARD--------------------- */
exports.dashboard = async (req, res, next) => {
  try {
    const employeeId = req.user.id;

    // 1️⃣ Count certificates issued by this employee
    const certificatesCount = await prisma.certificate.count({
      where: { issuedById: employeeId },
    });

    // 2️⃣ Count total students
    const totalStudents = await prisma.student.count();

    return res.status(200).json({
      success: true,
      data: {
        certificatesIssued: certificatesCount,
        totalStudents: totalStudents,
      },
    });
  } catch (err) {
    next(err);
  }
};

const { prisma } = require("../utils/prisma");

/**---------------------EMPLOYEE-DASHBOARD--------------------- */
// exports.dashboard = async (req, res, next) => {
//   try {
//     const employeeId = req.user.id; // Logged-in employee

//     // 1️⃣ Count certificates issued by this employee
//     const certificatesCount = await prisma.certificate.count({
//       where: { issuedById: employeeId },
//     });

//     // 2️⃣ Count total students
//     const totalStudents = await prisma.student.count();

//     // 3️⃣ Fetch last created certificates by this employee (newest first)
//     const lastCertificates = await prisma.certificate.findMany({
//       where: { issuedById: employeeId },
//       include: { student: true },
//       orderBy: { createdAt: "desc" }, // newest first
//       take: 10, // last 10 certificates
//     });

//     return res.status(200).json({
//       success: true,
//       data: {
//         certificatesIssued: certificatesCount,
//         totalStudents,
//         lastCertificates,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };
