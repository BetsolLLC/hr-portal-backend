import "dotenv/config";

const loadEnv = (key) => {
  if (key === undefined || key === "" || key.trim() === "") {
    console.error("Missing env variable(s)");
    process.exit(1);
  }

  return key.trim();
};

// Server Config
const SALT = 10;
const ENV = loadEnv(process.env.ENV);
const PORT = loadEnv(process.env.PORT);
const LOG_LEVEL = loadEnv(process.env.LOG_LEVEL);

// Roles
const ROLES = { END_USER: "user", ADMIN: "admin" };

// Database Config
const DB_HOST = loadEnv(process.env.DB_HOST);
const DB_PORT = loadEnv(process.env.DB_PORT);
const DB_USER = loadEnv(process.env.DB_USER);
const DB_PASSWORD = loadEnv(process.env.DB_PASSWORD);
const DB_DATABASE = loadEnv(process.env.DB_DATABASE);

// JWT Config
const JWTSECRET = loadEnv(process.env.JWTSECRET);
const TOKEN_EXPIRY = loadEnv(process.env.TOKEN_EXPIRY);

// AWS S3 Config
const AWS_ACCESS_KEY_ID = loadEnv(process.env.AWS_ACCESS_KEY_ID);
const AWS_SECRET_ACCESS_KEY = loadEnv(process.env.AWS_SECRET_ACCESS_KEY);

export {
  ENV,
  PORT,
  SALT,
  LOG_LEVEL,
  ROLES,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  JWTSECRET,
  TOKEN_EXPIRY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
};
