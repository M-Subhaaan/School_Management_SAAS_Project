const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: "mysql",

    logging: false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log("MySQL Database Connected Successfully");
  } catch (error) {
    console.log("Unable to connect to the database ❌");
    console.log("Error Message: ", error.message);

    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };
