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
const AWS_BUCKET = loadEnv(process.env.AWS_BUCKET);
const AWS_REGION = loadEnv(process.env.AWS_REGION);
const FILE_SIZE = loadEnv(process.env.FILE_SIZE);
const FROM_EMAIL = loadEnv(process.env.FROM_EMAIL);

// Upload doc configs
const FILE_SIZE = loadEnv(process.env.FILE_SIZE);
const UPLOAD_FILE_ALGORITHM = loadEnv(process.env.UPLOAD_FILE_ALGORITHM);
const UPLOAD_FILE_SECRET = loadEnv(process.env.UPLOAD_FILE_SECRET);
const UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS = 120;

// Download files configs
const MAX_FILE_DOWNLOAD_COUNT = loadEnv(process.env.MAX_FILE_DOWNLOAD_COUNT);

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
  UPLOAD_FILE_ALGORITHM,
  UPLOAD_FILE_SECRET,
  UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS,
  AWS_BUCKET,
  FILE_SIZE,
  AWS_REGION,
  FROM_EMAIL,
  MAX_FILE_DOWNLOAD_COUNT,
};
