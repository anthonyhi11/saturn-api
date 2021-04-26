const app = require("./app");
const { PORT, DATABASE_URL, NODE_ENV } = require("./config");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    connectionString : DATABASE_URL,
    ssl: NODE_ENV == "development" ? false : { rejectUnauthorized: false }
  }
});

app.set("db", db);

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
