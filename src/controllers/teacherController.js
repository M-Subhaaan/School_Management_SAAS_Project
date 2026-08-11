const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const Account = require("../models/accountModel");
const School = require("../models/schoolModel");
const Teacher = require("../models/teacherModel");
const Subscription = require("../models/subscriptionModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createTeacher = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      qualification,
      joiningDate,
    } = req.body;

    // 1. Find logged-in user and account

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Account,
          as: "account",
        },
      ],
      transaction,
    });

    if (!user) {
      throw AppError("User not found", 404);
    }

    const account = user.account;

    if (!account) {
      throw AppError("Account not found", 404);
    }

    // 2. Find active subscription

    const subscription = await Subscription.findOne({
      where: {
        accountId: account.id,
        status: "ACTIVE",
      },
      include: [
        {
          association: "plan",
        },
      ],
      transaction,
    });

    if (!subscription) {
      throw AppError("Active subscription not found", 404);
    }

    const plan = subscription.plan;

    if (!plan) {
      throw AppError("Subscription Plan not found", 404);
    }

    // 3. Check requested school

    const school = await School.findOne({
      where: {
        id: schoolId,
        accountId: account.id,
      },
      transaction,
    });

    if (!school) {
      throw AppError(
        "School not found or does not belong to your account",
        404,
      );
    }

    if (school.status !== "ACTIVE") {
      throw AppError("School's status is not active", 400);
    }

    // 4. Check teacher limit

    const teacherCount = await Teacher.count({
      where: {
        accountId: account.id,
        status: "ACTIVE",
      },
      transaction,
    });

    if (teacherCount >= plan.maxTeachers) {
      throw AppError(
        `Your ${plan.name} plan allows a maximum of ${plan.maxTeachers} active teachers`,
        400,
      );
    }

    // 5. Create teacher

    const teacher = await Teacher.create(
      {
        accountId: account.id,
        schoolId: school.id,
        firstName,
        lastName,
        email,
        phone,
        employeeId,
        qualification,
        joiningDate,
        status: "ACTIVE",
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    // 6. Response

    res.status(201).json({
      status: "Success",
      data: {
        teacher,
        subscription: {
          plan: plan.name,
          maxTeachers: plan.maxTeachers,
          usedTeachers: teacherCount + 1,
          remainingTeachers: plan.maxTeachers - (teacherCount + 1),
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.getAllTeachers = catchAsync(async (req, res, next) => {
  const schoolId = req.query.schoolId;

  const userId = req.user.id;

  // 1. Find logged-in user and account

  const user = await User.findByPk(userId, {
    include: [
      {
        model: Account,
        as: "account",
      },
    ],
  });

  if (!user) {
    throw AppError("User not found", 404);
  }

  const account = user.account;

  if (!account) {
    throw AppError("Account not found", 404);
  }

  // 2. Build teacher filter

  const where = {
    accountId: account.id,
    status: "ACTIVE",
  };

  // 3. If schoolId is provided, verify the school

  if (schoolId) {
    const school = await School.findOne({
      where: {
        id: schoolId,
        accountId: account.id,
      },
    });

    if (!school) {
      throw AppError(
        "School not found or does not belong to your account",
        404,
      );
    }

    where.schoolId = schoolId;
  }

  // 4. Get teachers

  const teachers = await Teacher.findAll({
    where,

    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug"],
      },
    ],

    order: [["createdAt", "DESC"]],
  });

  // 5. Response

  res.status(200).json({
    status: "success",
    results: teachers.length,
    data: {
      teachers,
    },
  });
});

exports.getTeacherById = catchAsync(async (req, res, next) => {
  const teacherId = req.params.id;
  const userId = req.user.id;

  // 1. Find logged-in user and account
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Account,
        as: "account",
      },
    ],
  });

  if (!user) {
    throw AppError("User not found", 404);
  }

  const account = user.account;

  if (!account) {
    throw AppError("Account not found", 404);
  }

  const teacher = await Teacher.findOne({
    where: {
      id: teacherId,
      accountId: account.id,
    },
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug", "status"],
      },
    ],
  });

  if (!teacher) {
    throw AppError("Teacher not found or does not belong to your account", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      teacher,
    },
  });
});
