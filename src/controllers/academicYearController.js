const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const Account = require("../models/accountModel");
const School = require("../models/schoolModel");
const AcademicYear = require("../models/academicYearModel");
const AcademicTerm = require("../models/academicTermModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAcademicYear = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { schoolId, name, startDate, endDate, isCurrent, status } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ model: Account, as: "account" }],
      transaction,
    });

    if (!user || !user.account) {
      throw AppError("User or Account not found", 404);
    }
    const account = user.account;

    const school = await School.findOne({
      where: { id: schoolId, accountId: account.id },
      transaction,
    });

    if (!school) {
      throw AppError(
        "School not found or does not belong to your account",
        404,
      );
    }

    if (school.status !== "ACTIVE") {
      throw AppError("Cannot create academic year for an inactive school", 400);
    }

    const existingYear = await XcademicYear.findOne({
      where: { accountId: account.id, schoolId, name },
      transaction,
    });

    if (existingYear) {
      throw AppError(
        "Academic year " + name + " already exists for this school",
        409,
      );
    }

    const setAsCurrent = isCurrent === true;

    if (setAsCurrent) {
      await AcademicYear.update(
        { isCurrent: false },
        { where: { accountId: account.id, schoolId }, transaction },
      );
    }

    const academicYear = await AcademicYear.create(
      {
        accountId: account.id,
        schoolId,
        name,
        startDate,
        endDate,
        isCurrent: setAsCurrent,
        status: status || (setAsCurrent ? "ACTIVE" : "UPCOMING"),
      },
      { transaction },
    );

    await transaction.commit();

    res.status(201).json({
      status: "success",
      data: {
        academicYear,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.getAllAcademicYears = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const {
    schoolId,
    status,
    isCurrent,
    search,
    page = "1",
    limit = "20",
  } = req.query;

  const where = { accountId: account.id };

  if (schoolId) {
    const school = await School.findOne({
      where: { id: schoolId, accountId: account.id },
    });
    if (!school) {
      return next(
        AppError("School not found or does not belong to your account", 404),
      );
    }
    where.schoolId = schoolId;
  }

  if (status) {
    where.status = status.toUpperCase();
  }

  if (isCurrent !== undefined) {
    where.isCurrent = isCurrent === "true";
  }

  if (search && search.trim()) {
    where.name = { [Op.like]: "%" + search.trim() + "%" };
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const { count, rws: academicYears } = await AcademicYear.findAndCountAll({
    where,
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug"],
      },
      {
        model: AcademicTerm,
        as: "terms",
        attributes: [
          "id",
          "name",
          "startDate",
          "endDate",
          "isCurrent",
          "status",
        ],
      },
    ],
    order: [["startDate", "DESC"]],
    limit: parsedLimit,
    offset,
    distinct: true,
  });

  const totalPages = Math.ceil(count / parsedLimit);

  res.status(200).json({
    status: "success",
    data: {
      academicYears,
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

exports.getAcademicYearById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const academicYear = await AcademicYear.findOne({
    where: { id, accountId: account.id },
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug", "status"],
      },
      {
        model: AcademicTerm,
        as: "terms",
      },
    ],
  });

  if (!academicYear) {
    return next(
      AppError(
        "Academic year not found or does not belong to your account",
        404,
      ),
    );
  }

  res.status(200).json({
    status: "success",
    data: { academicYear },
  });
});

exports.updateAcademicYear = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent, status } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ model: Account, as: "account" }],
      transaction,
    });

    if (!user || !user.account) {
      throw AppError("User or Account not found", 404);
    }
    const account = user.account;

    const academicYear = await AcademicYear.findOne({
      where: { id, accountId: account.id },
      transaction,
    });

    if (!academicYear) {
      throw AppError("Academic year not found", 404);
    }

    if (isCurrent === true) {
      await AcademicYear.update(
        { isCurrent: false },
        {
          where: { accountId: account.id, schoolId: academicYear.schoolId },
          transaction,
        },
      );
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (isCurrent !== undefined) updates.isCurrent = isCurrent;
    if (status !== undefined) updates.status = status;

    await academicYear.update(updates, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: {
        academicYear,
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.setCurrentAcademicYear = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ model: Account, as: "account" }],
      transaction,
    });

    if (!user || !user.account) {
      throw AppError("User or Account not found", 404);
    }
    const account = user.account;

    const academicYear = await AcademicYear.findOne({
      where: { id, accountId: account.id },
      transaction,
    });

    if (!academicYear) {
      throw AppError("Academic year not found", 404);
    }

    await AcademicYear.update(
      { isCurrent: false },
      {
        where: { accountId: account.id, schoolId: academicYear.schoolId },
        transaction,
      },
    );

    await academicYear.update(
      { isCurrent: true, status: "ACTIVE" },
      { transaction },
    );

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Academic year set as current active session successfully",
      data: { academicYear },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.deleteAcademicYear = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const academicYear = await AcademicYear.findOne({
    where: { id, accountId: account.id },
  });

  if (!academicYear) {
    return next(AppError("Academic year not found", 404));
  }

  await academicYear.destroy();

  res.status(200).json({
    status: "success",
    message: "Academic year deleted successfully",
  });
});
