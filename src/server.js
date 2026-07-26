const env = require("./config/env");
const { sequelize, connectDatabase } = require("./config/db");
const app = require("./app");

const startServer = async () => {
  await connectDatabase();

  await sequelize.sync();

  console.log("✅ Database tables synchronized");

  app.listen(env.port, () => {
    console.log(`Server is Running on Port ${env.port}...`);
  });
};

startServer();
