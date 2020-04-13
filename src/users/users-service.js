const xss = require("xss");
const bcrypt = require("bcryptjs");
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

UsersService = {
  validatePassword(password) {
    //validating password
    if (password.length < 8) {
      return `Password must be more than 8 characters`;
    }
    if (password.length > 72) {
      return `Password must be less than 72 characters`;
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return `Password cannot start or end with spaces`;
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain one upper case, lower case, number, and special character";
    }
    return null;
  },

  hasEmail(knex, email) {
    return knex
      .select("*")
      .from("users")
      .where("email", email)
      .first()
      .then((user) => !!user);
  },

  hashPassword(password) {
    //hashing password before inserting into database
    return bcrypt.hash(password, 12);
  },

  getUsers(db, orgId) {
    return db.select("*").from("users").where("org_id", orgId); //returns users for specific organization
  },

  addUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  updateUser(db, id, newInfo) {
    return db("users")
      .where("id", id)
      .update(newInfo)
      .returning("*")
      .then(([user]) => user);
  },

  serializeUser(user) {
    return {
      first_name: xss(user.first_name),
      last_name: xss(user.last_name),
      email: xss(user.email),
    };
  },
};

module.exports = UsersService;
