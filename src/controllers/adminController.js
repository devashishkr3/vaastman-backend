const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");
const bcrypt = require("bcrypt");

/**---------------------ADMIN-DASHBOARD------------------------------ */
exports.dashboard = async (req, res, next) => {
  try {
    const totalEmployees = await prisma.user.count({
      where: { role: "EMPLOYEE" },
    });

    const totalUniversities = await prisma.university.count();
    const totalColleges = await prisma.college.count();
    const totalStudents = await prisma.student.count();
    const totalCertificates = await prisma.certificate.count();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        totalEmployees,
        totalUniversities,
        totalColleges,
        totalStudents,
        totalCertificates,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------CREATE_EMPLOYEE-------------------------------- */
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;

    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) throw new AppError("Employee already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobile,
        role: "EMPLOYEE",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: newEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-ALL-EMPLOYEE------------------------------ */
exports.getAllEmployee = async (req, res, next) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "All employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-EMPLOYEE-BY-ID----------------------------- */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new AppError("Employee not found", 404);

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------UPDATE-EMPLOYEE--------------------------------- */
exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, mobile } = req.body;

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new AppError("Employee not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, mobile },
    });

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------DELETE-EMPLOYEE--------------------------------- */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new AppError("Employee not found", 404);

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------TOGGLE-ACTIVE-EMPLOYEE-------------------------- */
exports.toggleActiveEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) throw new AppError("Employee not found", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !employee.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `Employee ${
        updated.isActive ? "Activated" : "Deactivated"
      } successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**---------------------CREATE-STUDENT---------------------------------- */
exports.createStudent = async (req, res, next) => {
  return res.send("Create Student");
};

/**---------------------GET-ALL-STUDENTS-------------------------------- */
exports.getAllStudents = async (req, res, next) => {
  return res.send("Get All Students");
};

/**---------------------GET-STUDENT-BY-ID------------------------------ */
exports.getStudentById = async (req, res, next) => {
  return res.send("Get Student By Id");
};

/**---------------------UPDATE-STUDENT-------------------------------- */
exports.updateStudent = async (req, res, next) => {
  return res.send("Update Student");
};

/**---------------------DELETE-STUDENT-------------------------------- */
exports.deleteStudent = async (req, res, next) => {
  return res.send("Delete Student");
};

/**---------------------CREATE-CERTIFICATE----------------------------- */
exports.createCertificate = async (req, res, next) => {
  return res.send("Create Certificate");
};

/**---------------------GET-ALL-CERTIFICATE---------------------------- */
exports.getAllCertificate = async (req, res, next) => {
  return res.send("Get All Certificate");
};

/**---------------------GET-CERTIFICATE-BY-ID------------------------- */
exports.getCertificateById = async (req, res, next) => {
  return res.send("Get Certificate By Id");
};

/**---------------------UPDATE-CERTIFICATE---------------------------- */
exports.updateCertificate = async (req, res, next) => {
  return res.send("Update Certificate");
};

/**---------------------DELETE-CERTIFICATE---------------------------- */
exports.deleteCertificate = async (req, res, next) => {
  return res.send("Delete Certificate");
};

/**---------------------GET-CERTIFICATE-BY-STUDENT-------------------- */
exports.getCertificateByStudent = async (req, res, next) => {
  return res.send("Get Certificate By Student");
};

/**---------------------GET-ALL-CERTIFICATES-BY-COLLEGE--------------- */
exports.getAllCertificatesByCollege = async (req, res, next) => {
  return res.send("Get All Certificates By College");
};

/**---------------------GET-ALL-CERTIFICATES-BY-UNIVERSITY------------ */
exports.getAllCertificatesByUniversity = async (req, res, next) => {
  return res.send("Get All Certificates By University");
};
