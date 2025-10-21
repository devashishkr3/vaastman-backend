const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");

/**--------------------CREATE-COLLEGE-------------------------------------- */
exports.createCollege = async (req, res, next) => {
  try {
    const { name, address, collegeCode, universityId } = req.body;

    // Check if the university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });
    if (!university) throw new AppError("University not found", 404);

    // Check if a college with same name or code exists under same university
    const existing = await prisma.college.findFirst({
      where: {
        AND: [{ name }, { universityId }],
      },
    });
    if (existing)
      throw new AppError("College already exists under this university", 400);

    const newCollege = await prisma.college.create({
      data: { name, address, collegeCode, universityId },
    });

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: newCollege,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-ALL-COLLEGES------------------------------------ */
exports.getAllColleges = async (req, res, next) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        university: true,
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "All colleges fetched successfully",
      data: colleges,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------GET-COLLEGE-BY-ID---------------------------------- */
exports.getCollegeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        university: true,
        students: true,
      },
    });

    if (!college) throw new AppError("College not found", 404);

    res.status(200).json({
      success: true,
      message: "College fetched successfully",
      data: college,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------UPDATE-COLLEGE------------------------------------ */
exports.updateCollege = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, collegeCode, universityId } = req.body;

    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) throw new AppError("College not found", 404);

    if (universityId) {
      const uniExist = await prisma.university.findUnique({
        where: { id: universityId },
      });
      if (!uniExist) throw new AppError("Invalid universityId", 400);
    }

    const updatedCollege = await prisma.college.update({
      where: { id },
      data: { name, address, collegeCode, universityId },
    });

    res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: updatedCollege,
    });
  } catch (error) {
    next(error);
  }
};

/**--------------------DELETE-COLLEGE------------------------------------ */
exports.deleteCollege = async (req, res, next) => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({ where: { id } });
    if (!college) throw new AppError("College not found", 404);

    await prisma.college.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "College deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**---------------------GET-STUDENTS-BY-COLLEGE-------------------------- */
exports.getStudentsByCollege = async (req, res, next) => {
  try {
    const { id } = req.params;

    const students = await prisma.student.findMany({
      where: { collegeId: id },
      include: {
        university: true,
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
