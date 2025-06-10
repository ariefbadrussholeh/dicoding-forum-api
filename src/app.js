require('dotenv').config();
const createServer = require('./Infrastructures/http/createServer');
const container = require('./Infrastructures/container');

const start = async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
  console.log(
    `[INFO] Running in ${process.env.NODE_ENV} mode | DB: ${process.env.PGDATABASE} | PORT: ${process.env.PORT}`,
  );
};

start();
