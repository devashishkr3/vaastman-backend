const bcrypt = require("bcrypt");
const {
  generateRefreshToken,
  generateAccessToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const AppError = require("../utils/error");
const { prisma } = require("../utils/prisma");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    const existUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existUser) {
      throw new AppError("user already exist, please login", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "EMPLOYEE",
        mobile,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(process.env.JWT_REFRESH_SECRET);
    console.log(process.env.JWT_ACCESS_SECRET);

    const existUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!existUser) {
      throw new AppError("Your are not registered with us.", 400);
    }

    const isPasswordMatch = await bcrypt.compare(password, existUser.password);

    if (!isPasswordMatch) {
      throw new AppError("Invalid Password", 400);
    }

    const payload = {
      id: existUser.id,
      email: existUser.email,
      role: existUser.role,
    };

    const refreshToken = await generateRefreshToken(payload);
    const accessToken = await generateAccessToken(payload);

    return res.status(200).json({
      success: true,
      message: "Login Successfull",
      data: {
        existUser,
        resreshToken: refreshToken,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("AuthHeader is required", 400);
    }

    const refreshToken = authHeader && authHeader.split(" ")[1];
    if (!refreshToken) {
      throw new AppError("Refresh Token is required", 400);
    }

    const isBlacklisted = await prisma.blacklistedToken.findUnique({
      where: {
        token: refreshToken,
      },
    });
    if (isBlacklisted) {
      throw new AppError("Refresh token is already blocklisted", 400);
    }

    const decode = await verifyRefreshToken(refreshToken);
    const payload = {
      id: decode.id,
      email: decode.email,
      role: decode.role,
    };

    const accessToken = await generateAccessToken(payload);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("AuthHeader is required", 400);
    }

    const refreshToken = authHeader && authHeader.split(" ")[1];
    console.log(refreshToken);

    if (!refreshToken) {
      throw new AppError("Refresh Token is required", 400);
    }
    const existToken = await prisma.blacklistedToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (existToken) {
      return res.status(200).json({
        success: true,
        message: "You are already Logged out",
      });
    }

    await prisma.blacklistedToken.create({
      data: {
        token: refreshToken,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Logout Successfull",
    });
  } catch (error) {
    next(error);
  }
};
