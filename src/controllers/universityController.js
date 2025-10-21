const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");

/**--------------------CREATE-UNIVERSITY------------------------------- */
exports.createUniversity = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    const exist = await prisma.university.findUnique({ where: { name } });
    if (exist) throw new AppError("University already exists", 400);

    const newUniversity = await prisma.university.create({
      data: { name, address },
    });

    res.status(201).json({
      success: true,
      message: "University created successfully",
      data: newUniversity,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------UPDATE-UNIVERSITY------------------------------- */
exports.updateUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) throw new AppError("University not found", 404);

    const updated = await prisma.university.update({
      where: { id },
      data: { name, address },
    });

    res.status(200).json({
      success: true,
      message: "University updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------DELETE-UNIVERSITY------------------------------- */
exports.deleteUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const university = await prisma.university.findUnique({ where: { id } });
    if (!university) throw new AppError("University not found", 404);

    await prisma.university.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "University deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-ALL-UNIVERSITY------------------------------- */
exports.getAllUniversity = async (req, res, next) => {
  try {
    const universities = await prisma.university.findMany({
      include: {
        _count: {
          select: { colleges: true, students: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "All universities fetched successfully",
      data: universities,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-UNIVERSITY-BY-ID------------------------------- */
exports.getUniversityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        colleges: true,
        students: true,
      },
    });

    if (!university) throw new AppError("University not found", 404);

    res.status(200).json({
      success: true,
      message: "University fetched successfully",
      data: university,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-COLLEGE-BY-UNIVERSITY---------------------------- */
exports.getCollegeByUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const colleges = await prisma.college.findMany({
      where: { universityId: id },
      include: {
        _count: { select: { students: true } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Colleges fetched successfully",
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-STUDENT-BY-UNIVERSITY---------------------------- */
exports.getStudentByUniversity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const students = await prisma.student.findMany({
      where: { universityId: id },
      include: {
        college: true,
        certificates: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: students,
    });
  } catch (error) {
    next(error);
  }
};
