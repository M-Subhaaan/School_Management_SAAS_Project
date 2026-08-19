const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const Payment = require("../models/paymentModel");
const School = require("../models/schoolModel");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const AcademicYear = require("../models/academicYearModel");
const AcademicTerm = require("../models/academicTermModel");

// User → Account
User.hasOne(Account, {
  foreignKey: "ownerId",
  as: "account",
});

Account.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

// Account → Payment
Account.hasMany(Payment, {
  foreignKey: "accountId",
  as: "payments",
});

Payment.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// Account → Subscription
Account.hasOne(Subscription, {
  foreignKey: "accountId",
  as: "subscription",
});

Subscription.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// Subscription → Plan
Subscription.belongsTo(SubscriptionPlan, {
  foreignKey: "planId",
  as: "plan",
});

SubscriptionPlan.hasMany(Subscription, {
  foreignKey: "planId",
  as: "subscriptions",
});

// Account → Schools
Account.hasMany(School, {
  foreignKey: "accountId",
  as: "schools",
});

// School → Account
School.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});
// Account → Teacher
Account.hasMany(Teacher, {
  foreignKey: "accountId",
  as: "teachers",
});

Teacher.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// School → Teacher
School.hasMany(Teacher, {
  foreignKey: "schoolId",
  as: "teachers",
});

Teacher.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

// Account → Students
Account.hasMany(Student, {
  foreignKey: "accountId",
  as: "students",
});

Student.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// School → Students
School.hasMany(Student, {
  foreignKey: "schoolId",
  as: "students",
});

Student.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

// Account → AcademicYear
Account.hasMany(AcademicYear, {
  foreignKey: "accountId",
  as: "academicYears",
});

AcademicYear.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// School → AcademicYear
School.hasMany(AcademicYear, {
  foreignKey: "schoolId",
  as: "academicYears",
});

AcademicYear.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

// AcademicYear → AcademicTerm
AcademicYear.hasMany(AcademicTerm, {
  foreignKey: "academicYearId",
  as: "terms",
});

AcademicTerm.belongsTo(AcademicYear, {
  foreignKey: "academicYearId",
  as: "academicYear",
});

// Account → AcademicTerm
Account.hasMany(AcademicTerm, {
  foreignKey: "accountId",
  as: "academicTerms",
});

AcademicTerm.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// School → AcademicTerm
School.hasMany(AcademicTerm, {
  foreignKey: "schoolId",
  as: "academicTerms",
});

AcademicTerm.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

module.exports = {
  User,
  Account,
  Subscription,
  SubscriptionPlan,
  Payment,
  School,
  Teacher,
  Student,
  AcademicYear,
  AcademicTerm,
};
