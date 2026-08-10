const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const School = require("../models/schoolModel");
const Account = require("../models/accountModel");
const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createSchool = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      email,
      phone,
      website,
      registrationNumber,
      logo,
      country,
      state,
      city,
      address,
      postalCode,
      timezone,
      currency,
    } = req.body;

    // 1. Get Logged-in User's Account

    const user = await User.findByPk(req.user.id, {
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

    // 2. Find Active Subscription

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

    // 3. Count Existing Schools

    const schoolCount = await School.count({
      where: {
        accountId: account.id,
      },
      transaction,
    });

    // 4. Check Subscription Limit

    if (schoolCount >= subscription.plan.maxSchools) {
      throw AppError(
        `Your ${subscription.plan.name} plan allows only ${subscription.plan.maxSchools} school(s). Please upgrade your plan.`,
        403,
      );
    }

    // 5. Generate Slug

    let slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Make slug unique
    slug = `${slug}-${Date.now()}`;

    // 6. Create School

    const school = await School.create(
      {
        accountId: account.id,
        name,
        slug,
        email,
        phone,
        website,
        registrationNumber,
        logo,
        country,
        state,
        city,
        address,
        postalCode,
        timezone,
        currency,
        status: "ACTIVE",
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    res.status(201).json({
      status: "success",
      data: {
        school,
        subscription: {
          plan: subscription.plan.name,
          maxSchools: subscription.plan.maxSchools,
          usedSchools: schoolCount + 1,
          remainingSchools: subscription.plan.maxSchools - (schoolCount + 1),
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.getMySchools = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
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

  const schools = await School.findAll({
    where: {
      accountId: account.id,
      status: "ACTIVE",
    },

    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    status: "Success",
    results: schools.length,

    data: {
      schools,
    },
  });
});

exports.getSchoolById = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const schoolId = req.params.id;

  const user = await User.findByPk(userId, {
    include: [
      {
        model: Account,
        as: "account",
      },
    ],
  });

  if (!user) {
    throw AppError("User Not Found", 404);
  }

  const account = user.account;

  if (!account) {
    throw AppError("Account Not Found", 404);
  }

  const school = await School.findOne({
    where: {
      id: schoolId,
      accountId: account.id,
    },
  });

  if (!school) {
    throw AppError("School Not Found", 404);
  }

  res.status(200).json({
    status: "Success",
    data: {
      school,
    },
  });
});

exports.updateSchool = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const schoolId = req.params.id;

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

  const school = await School.findOne({
    where: {
      id: schoolId,
      accountId: account.id,
    },
  });

  if (!school) {
    throw AppError("School not found", 404);
  }

  const { name, address, phone, email } = req.body;

  const updates = {};

  if (name !== undefined) {
    updates.name = name;

    // Generate new slug when name changes
    updates.slug = `${name}-${Date.now()}`
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (address !== undefined) {
    updates.address = address;
  }

  if (phone !== undefined) {
    updates.phone = phone;
  }

  if (email !== undefined) {
    updates.email = email;
  }

  await school.update(updates);

  res.status(200).json({
    status: "success",
    data: {
      school,
    },
  });
});

exports.deactivateSchool = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const schoolId = req.params.id;

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

  const school = await School.findOne({
    where: {
      id: schoolId,
      accountId: account.id,
    },
  });

  if (!school) {
    throw AppError("School not found", 404);
  }

  if (school.status === "INACTIVE") {
    throw AppError("School is already inactive", 400);
  }

  await school.update({
    status: "INACTIVE",
  });

  res.status(200).json({
    status: "success",
    message: "School deactivated successfully",
    data: {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        status: school.status,
      },
    },
  });
});

exports.activateSchool = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const schoolId = req.params.id;

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

  const school = await School.findOne({
    where: {
      id: schoolId,
      accountId: account.id,
    },
  });

  if (!school) {
    throw AppError("School not found", 404);
  }

  if (school.status === "ACTIVE") {
    throw AppError("School is already active", 400);
  }

  await school.update({
    status: "ACTIVE",
  });

  res.status(200).json({
    status: "success",
    message: "School activated successfully",
    data: {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        status: school.status,
      },
    },
  });
});
