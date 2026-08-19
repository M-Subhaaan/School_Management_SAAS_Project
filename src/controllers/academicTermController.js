const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const Account = require("../models/accountModel");
const School = require("../models/schoolModel");
const AcademicYear = require("../models/academicYearModel");
const AcademicTerm = require("../models/academicTermModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAcademicTerm = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { schoolId, academicYearId, name, startDate, endDate, isCurrent, status } = req.body;

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
      throw AppError("School not found or does not belong to your account", 404);
    }

    const academicYear = await AcademicYear.findOne({
      where: { id: academicYearId, accountId: account.id, schoolId },
      transaction,
    });

     if (!academicYear) {
      throw AppError("Academic year not found for this school", 404);
    }

    if (new Date(startDate) < new Date(academicYear.startDate) || new Date(endDate) > new Date(academicYear.endDate)) {
      throw AppError('Term dates must fall within Academic Year dates', 400);
    }

    const existingTerm = await AcademicTerm.findOne({
      where: { accountId: account.id, schoolId, academicYearId, name },
      transaction,
    });

     if (existingTerm) {
      throw AppError('Academic term ' + name + ' already exists in this academic year', 409);
    }

    const setAsCurrent = isCurrent === true;

    if (setAsCurrent) {
      await AcademicTerm.update(
        { isCurrent: false },
        { where: { accountId: account.id, schoolId, academicYearId }, transaction }
      );
    }

    const academicTerm = await AcademicTerm.create(
      {
        accountId: account.id,
        schoolId,
        academicYearId,
        name,
        startDate,
        endDate,
        isCurrent: setAsCurrent,
        status: status || (setAsCurrent ? "ACTIVE" : "UPCOMING"),
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      status: "success",
      data: { academicTerm },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.getAllAcademicTerms = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const { schoolId, academicYearId, status, isCurrent, page = "1", limit = "20" } = req.query;

  const where = { accountId: account.id };

  if (schoolId) where.schoolId = schoolId;
  if (academicYearId) where.academicYearId = academicYearId;
  if (status) where.status = status.toUpperCase();
  if (isCurrent !== undefined) where.isCurrent = isCurrent === "true";

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const { count, rows: academicTerms } = await AcademicTerm.findAndCountAll({
    where,
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug"],
      },
      {
        model: AcademicYear,
        as: "academicYear",
        attributes: ["id", "name", "startDate", "endDate", "isCurrent"],
      },
    ],
    order: [["startDate", "ASC"]],
    limit: parsedLimit,
    offset,
    distinct: true,
  });

  const totalPages = Math.ceil(count / parsedLimit);

  res.status(200).json({
    status: "success",
    data: {
      academicTerms,
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

exports.getAcademicTermById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const academicTerm = await AcademicTerm.findOne({
    where: { id, accountId: account.id },
    include: [
      {
        model: School,
        as: "school",
        attributes: ["id", "name", "slug"],
      },
      {
        model: AcademicYear,
        as: "academicYear",
      },
    ],
  });

  if (!academicTerm) {
    return next(AppError("Academic term not found or does not belong to your account", 404));
  }

  res.status(200).json({
    status: "success",
    data: { academicTerm },
  });
});

exports.updateAcademicTerm = catchAsync(async (req, res, next) => {
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

    const academicTerm = await AcademicTerm.findOne({
      where: { id, accountId: account.id },
      transaction,
    });

    if (!academicTerm) {
      throw AppError("Academic term not found", 404);
    }

    if (isCurrent === true) {
      await AcademicTerm.update(
        { isCurrent: false },
        { where: { accountId: account.id, academicYearId: academicTerm.academicYearId }, transaction }
      );
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (isCurrent !== undefined) updates.isCurrent = isCurrent;
    if (status !== undefined) updates.status = status;

    await academicTerm.update(updates, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      data: { academicTerm },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.setCurrentAcademicTerm = catchAsync(async (req, res, next) => {
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

    const academicTerm = await AcademicTerm.findOne({
      where: { id, accountId: account.id },
      transaction,
    });

     if (!academicTerm) {
      throw AppError("Academic term not found", 404);
    }

    await AcademicTerm.update(
      { isCurrent: false },
      { where: { accountId: account.id, academicYearId: academicTerm.academicYearId }, transaction }
    );

    await academicTerm.update({ isCurrent: true, status: "ACTIVE" }, { transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Academic term set as current term successfully",
      data: { academicTerm },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.deleteAcademicTerm = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { id } = req.params;

  const user = await User.findByPk(userId, {
    include: [{ model: Account, as: "account" }],
  });

  if (!user || !user.account) {
    return next(AppError("User or Account not found", 404));
  }
  const account = user.account;

  const academicTerm = await AcademicTerm.findOne({
    where: { id, accountId: account.id },
  });

  if (!academicTerm) {
    return next(AppError("Academic term not found", 404));
  }

  await academicTerm.destroy();

  res.status(200).json({
    status: "success",
    message: "Academic term deleted successfully",
  });
});
