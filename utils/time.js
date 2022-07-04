import { UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS } from "../config/config.js";
import { logger } from "../logger.js";

const isSignatureValid = (requestTime) => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    source: "utils.isSignatureValid",
  };

  const currentTime = new Date();
  const diffInSeconds = (currentTime.getTime() - requestTime.getTime()) / 1000;
  logger.debug(
    `currentTime:${currentTime.toUTCString()}, requestTime:${requestTime.toUTCString()} }}`
  );

  // checking if 'currentTime' is 'UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS' seconds
  // ahead of 'startTime' or not
  return (
    diffInSeconds >= 0 &&
    diffInSeconds <= UPLOAD_FILE_SIGNATURE_VALIDITY_IN_SECONDS
  );
};

export { isSignatureValid };
