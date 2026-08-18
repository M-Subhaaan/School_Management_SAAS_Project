const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const Account = require("../models/accountModel");
const School = require("../models/schoolModel");
const Student = require("../models/studentModel");
const Subscription = require("../models/subscriptionModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createStudent = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  const userId = req.user.id;
  try {
    const {
      schoolId,
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      admissionNumber,
      admissionDate,
      address,
    } = req.body;

    // 1. Resolve the authenticated user's account
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

    const subscription = await Subscription.findOne({
      where: {
        accountId: account.id,
        status: "ACTIVE",
      },
      include: [
        {
          model: SubscriptionPlan,
          as: "plan",
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

    // 3. Verify school ownership and ensure it is ACTIVE
    const school = await School.findOne({
      where: { id: schoolId, accountId: account.id },
      transaction,
    });

    if (!school) {
      throw AppError(
        "School not found or does not belong to your account.",
        404,
      );
    }

    if (school.status !== "ACTIVE") {
      throw AppError("Cannot add students to an inactive school.", 400);
    }

    // 4. Enforce plan student limit (scoped to entire account, not per school)
    const activeStudentCount = await Student.count({
      where: { accountId: account.id, status: "ACTIVE" },
      transaction,
    });

    if (activeStudentCount >= plan.maxStudents) {
      throw AppError(
        `Your ${plan.name} plan allows a maximum of ${plan.maxStudents} active ` +
          `students. You have used ${activeStudentCount}. ` +
          `Please upgrade your plan to add more students.`,
        403,
      );
    }

    // 5. Guard against duplicate admissionNumber within the same school
    const duplicateAdmission = await Student.findOne({
      where: { accountId: account.id, schoolId, admissionNumber },
      transaction,
    });

    if (duplicateAdmission) {
      throw AppError(
        `Admission number '${admissionNumber}' is already registered in this school.`,
        409,
      );
    }

    // 6. Persist the new student
    const student = await Student.create(
      {
        accountId: account.id,
        schoolId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        gender,
        dateOfBirth: dateOfBirth || null,
        admissionNumber,
        admissionDate,
        address: address || null,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      status: "success",
      data: {
        student,
        quota: {
          plan: plan.name,
          maxStudents: plan.maxStudents,
          usedStudents: activeStudentCount + 1,
          remainingStudents: plan.maxStudents - (activeStudentCount + 1),
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.getAllStudents = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

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

  const {
    schoolId,
    status = "ACTIVE",
    gender,
    search,
    page = "1",
    limit = "20",
  } = req.query;

  // ── Validate and normalise status ─────────────────────────────────────────
  const ALLOWED_STATUSES = ["ACTIVE", "INACTIVE"];
  const normalizedStatus = status.toUpperCase();

  if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
    return next(
      AppError(
        `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(", ")}.`,
        400,
      ),
    );
  }

  // Always scope queries to the authenticated account (multi-tenant isolation)
  const where = {
    accountId: account.id,
    status: normalizedStatus,
  };

  // ── Optional filter: school ───────────────────────────────────────────────
  if (schoolId) {
    const school = await School.findOne({
      where: { id: schoolId, accountId: account.id },
    });

    if (!school) {
      return next(
        AppError("School not found or does not belong to your account.", 404),
      );
    }

    where.schoolId = schoolId;
  }

  // ── Optional filter: gender ───────────────────────────────────────────────
  if (gender) {
    const ALLOWED_GENDERS = ["MALE", "FEMALE", "OTHER"];
    const normalizedGender = gender.toUpperCase();

    if (!ALLOWED_GENDERS.includes(normalizedGender)) {
      return next(
        AppError(
          `Invalid gender. Allowed values: ${ALLOWED_GENDERS.join(", ")}.`,
          400,
        ),
      );
    }

    where.gender = normalizedGender;
  }

  // ── Optional filter: full-text search ────────────────────────────────────
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { firstName: { [Op.like]: term } },
      { lastName: { [Op.like]: term } },
      { admissionNumber: { [Op.like]: term } },
    ];
  }

  // ── Pagination: clamp and parse ───────────────────────────────────────────
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  // ── Execute the query ─────────────────────────────────────────────────────
  const { count, rows: students } = await Student.findAndCountAll({
    where,
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parsedLimit,
    offset,
    distinct: true, // required for an accurate count when associations are joined
  });

  const totalPages = Math.ceil(count / parsedLimit);

  return res.status(200).json({
    status: "success",
    data: {
      students,
      pagination: {
        total: count,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
    },
  });
});

exports.getStudentById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const studentId = req.params.id;

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

  const student = await Student.findOne({
    where: { id: studentId, accountId: account.id },
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug", "status"],
      },
    ],
  });

  if (!student) {
    return next(
      AppError("Student not found or does not belong to your account.", 404),
    );
  }

  return res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

exports.updateStudent = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const studentId = req.params.id;

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

  const student = await Student.findOne({
    where: { id: studentId, accountId: account.id },
  });

  if (!student) {
    return next(
      AppError("Student not found or does not belong to your account.", 404),
    );
  }

  // Strict allowlist — prevents mass-assignment of restricted fields
  const UPDATABLE_FIELDS = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
  ];

  const updates = {};
  UPDATABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return next(AppError("No valid fields provided for update.", 400));
  }

  await student.update(updates);

  return res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

exports.deactivateStudent = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const studentId = req.params.id;

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

  const student = await Student.findOne({
    where: { id: studentId, accountId: account.id },
  });

  if (!student) return next(AppError("Student not found.", 404));

  if (student.status === "INACTIVE") {
    return next(AppError("Student is already inactive.", 400));
  }

  await student.update({ status: "INACTIVE" });

  return res.status(200).json({
    status: "success",
    message: "Student deactivated successfully.",
    data: {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        status: student.status,
      },
    },
  });
});

exports.activateStudent = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  const userId = req.user.id;
  const studentId = req.params.id;
  try {
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

    const student = await Student.findOne({
      where: { id: studentId, accountId: account.id },
      transaction,
    });

    if (!student) throw AppError("Student not found.", 404);

    if (student.status === "ACTIVE") {
      throw AppError("Student is already active.", 400);
    }

    // Re-validate plan limit before re-activating
    const subscription = await Subscription.findOne({
      where: {
        accountId: account.id,
        status: "ACTIVE",
      },
      include: [
        {
          model: SubscriptionPlan,
          as: "plan",
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

    const activeStudentCount = await Student.count({
      where: { accountId: account.id, status: "ACTIVE" },
      transaction,
    });

    if (activeStudentCount >= plan.maxStudents) {
      throw AppError(
        `Your ${plan.name} plan allows a maximum of ${plan.maxStudents} active students. ` +
          `You have used ${activeStudentCount}. ` +
          `Please upgrade your plan or deactivate another student first.`,
        403,
      );
    }

    await student.update({ status: "ACTIVE" }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      status: "success",
      message: "Student activated successfully.",
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNumber: student.admissionNumber,
          status: student.status,
        },
        quota: {
          plan: plan.name,
          maxStudents: plan.maxStudents,
          usedStudents: activeStudentCount + 1,
          remainingStudents: plan.maxStudents - (activeStudentCount + 1),
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});
