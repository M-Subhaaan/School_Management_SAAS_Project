const env = require("./config/env");
const { sequelize, connectDatabase } = require("./config/db");
require("./config/associations");

const app = require("./app");

const startServer = async () => {
  await connectDatabase();
  //await sequelize.sync({ force: true });
  await sequelize.sync();

  console.log("✅ Database tables synchronized");

  app.listen(env.port, () => {
    console.log(`Server is Running on Port ${env.port}...`);
  });
};

startServer();
