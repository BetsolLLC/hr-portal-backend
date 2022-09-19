import "dotenv/config";

const loadEnv = (key, value) => {
  if (value === undefined || value === "" || value.trim() === "") {
    console.error("Missing env variable:", key);
    process.exit(1);
  }

  return value.trim();
};

// Server Config
const SALT = 10;
const ENV = loadEnv("ENV", process.env.ENV);
const PORT = loadEnv("PORT", process.env.PORT);
const LOG_LEVEL = loadEnv("LOG_LEVEL", process.env.LOG_LEVEL);

// Roles
const ROLES = { END_USER: "user", ADMIN: "admin" };

// Database Config
const DB_HOST = loadEnv("DB_HOST", process.env.DB_HOST);
const DB_PORT = loadEnv("DB_PORT", process.env.DB_PORT);
const DB_USER = loadEnv("DB_USER", process.env.DB_USER);
const DB_PASSWORD = loadEnv("DB_PASSWORD", process.env.DB_PASSWORD);
const DB_DATABASE = loadEnv("DB_DATABASE", process.env.DB_DATABASE);

// JWT Config
const JWTSECRET = loadEnv("JWTSECRET", process.env.JWTSECRET);
const TOKEN_EXPIRY = loadEnv("TOKEN_EXPIRY", process.env.TOKEN_EXPIRY);

// AWS S3 Config
const AWS_ACCESS_KEY_ID = loadEnv(
  "AWS_ACCESS_KEY_ID",
  process.env.AWS_ACCESS_KEY_ID
);
const AWS_SECRET_ACCESS_KEY = loadEnv(
  "AWS_SECRET_ACCESS_KEY",
  process.env.AWS_SECRET_ACCESS_KEY
);
const AWS_BUCKET = loadEnv("AWS_BUCKET", process.env.AWS_BUCKET);
const AWS_REGION = loadEnv("AWS_REGION", process.env.AWS_REGION);
const FROM_EMAIL = loadEnv("FROM_EMAIL", process.env.FROM_EMAIL);
const FORGOT_PASSWORD = loadEnv("FORGOT_PASSWORD", process.env.FORGOT_PASSWORD);

// Upload doc configs
const FILE_SIZE = loadEnv("FILE_SIZE", process.env.FILE_SIZE);
const UPLOAD_FILE_ALGORITHM = loadEnv(
  "UPLOAD_FILE_ALGORITHM",
  process.env.UPLOAD_FILE_ALGORITHM
);
const UPLOAD_FILE_SECRET = loadEnv(
  "UPLOAD_FILE_SECRET",
  process.env.UPLOAD_FILE_SECRET
);
const UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS = 120;

// Download files configs
const MAX_FILE_DOWNLOAD_COUNT = loadEnv(
  "MAX_FILE_DOWNLOAD_COUNT",
  process.env.MAX_FILE_DOWNLOAD_COUNT
);

//Blacklisted password
const BLACKLISTED_PASSWORDS = loadEnv(
  "BLACKLISTED_PASSWORDS",
  process.env.BLACKLISTED_PASSWORDS
);

// bulk user addition configs
const BULK_USER_ADDITION_FILE_SIZE = loadEnv(
  "BULK_USER_ADDITION_FILE_SIZE",
  process.env.BULK_USER_ADDITION_FILE_SIZE
);
const BULK_USER_ADDITION_COUNT = 10;

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
  FORGOT_PASSWORD,
  BLACKLISTED_PASSWORDS,
  BULK_USER_ADDITION_FILE_SIZE,
  BULK_USER_ADDITION_COUNT,
};
