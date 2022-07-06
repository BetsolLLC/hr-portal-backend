import db from "../db.js";
import { errorResponse } from "../interceptor/error.js";
const getFileUploadPath = async (doc_id, user) => {
  const details = await db.query(
    "SELECT doc_name FROM all_docs where id = $1",
    [doc_id]
  );
  if (details.rowCount === 0) {
    return new Error("Invalid document"), null;
  }
  return (
    null, `${user.batch}/${user.id}_${user.name}/${details.rows[0].doc_name}`
  );
};

export { getFileUploadPath };
