import db from "../db.js";

const getFileUploadPath = async (doc_id, user) => {
  const details = await db.query(
    "SELECT doc_name FROM all_docs where id = $1",
    [doc_id]
  );
  if (details.rowCount === 0) {
    return new Error("Invalid document"), null;
  }
  return (
    null, `${user.batch}/${user.id}_${user.email}/${details.rows[0].doc_name}`
  );
};

const getFileNameFromPath = (path) => {
  const pathArray = path.split("/");
  return pathArray[pathArray.length - 1] + ".pdf";
};

export { getFileUploadPath, getFileNameFromPath };
