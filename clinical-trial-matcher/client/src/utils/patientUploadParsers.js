const IDENTIFIABLE_KEY_PATTERN = /(^|_)(name|firstname|lastname|fullname|phone|mobile|email|address|ssn|aadhaar|passport|dob)($|_)/i;

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizePatient(patient = {}) {
  return {
    patientId: String(patient.patientId || "").trim(),
    age: Number(patient.age),
    gender: String(patient.gender || "").trim(),
    conditions: Array.isArray(patient.conditions) ? patient.conditions : splitList(patient.conditions),
    medications: Array.isArray(patient.medications) ? patient.medications : splitList(patient.medications),
    location: String(patient.location || "").trim()
  };
}

function parseCsvRow(line, headers) {
  const columns = line.split(",").map((entry) => entry.trim());
  return headers.reduce((acc, header, index) => {
    acc[header] = columns[index] || "";
    return acc;
  }, {});
}

export async function parsePatientUploadFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const text = await file.text();

  if (extension === "json") {
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : parsed.patients || [parsed];
    return records.map(normalizePatient);
  }

  if (extension === "csv") {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((header) => header.trim());
    const rows = lines.slice(1).map((line) => parseCsvRow(line, headers));
    return rows.map(normalizePatient);
  }

  throw new Error("Unsupported file type. Use CSV or JSON.");
}

export function hasIdentifiableKeys(records = []) {
  return records.some((record) =>
    Object.keys(record).some((key) => IDENTIFIABLE_KEY_PATTERN.test(key))
  );
}
