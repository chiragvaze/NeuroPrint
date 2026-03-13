import { parse } from "csv-parse/sync";

function parseCsvBuffer(buffer) {
  const content = buffer.toString("utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

function parseJsonBuffer(buffer) {
  const parsed = JSON.parse(buffer.toString("utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.patients)) return parsed.patients;
  return [parsed];
}

export function parseUploadedPatients(file) {
  if (!file) {
    const error = new Error("Upload file is required.");
    error.statusCode = 400;
    throw error;
  }

  const extension = file.originalname.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCsvBuffer(file.buffer);
  }

  if (extension === "json") {
    return parseJsonBuffer(file.buffer);
  }

  const error = new Error("Unsupported file type. Upload CSV or JSON.");
  error.statusCode = 400;
  throw error;
}
