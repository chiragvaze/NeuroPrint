import { parseUploadedPatients } from "../services/patientUploadParser.js";

const IDENTIFIABLE_KEY_PATTERN = /(^|_)(name|firstname|lastname|fullname|phone|mobile|email|address|ssn|aadhaar|passport|dob)($|_)/i;
const PHONE_PATTERN = /\+?[0-9][0-9\-\s()]{7,}/;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function normalizePatient(input = {}) {
  return {
    patientId: String(input.patientId || "").trim(),
    age: Number(input.age),
    gender: String(input.gender || "").trim(),
    conditions: Array.isArray(input.conditions)
      ? input.conditions.map((value) => String(value).trim()).filter(Boolean)
      : String(input.conditions || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
    medications: Array.isArray(input.medications)
      ? input.medications.map((value) => String(value).trim()).filter(Boolean)
      : String(input.medications || "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
    location: String(input.location || "").trim()
  };
}

function hasIdentifiableKey(obj = {}) {
  return Object.keys(obj).some((key) => IDENTIFIABLE_KEY_PATTERN.test(key));
}

function hasIdentifiableValue(obj = {}) {
  return Object.values(obj).some((value) => {
    if (typeof value !== "string") return false;
    return PHONE_PATTERN.test(value) || EMAIL_PATTERN.test(value);
  });
}

function validateRequiredFields(patient) {
  if (!patient.patientId) return "patientId is required";
  if (!Number.isFinite(patient.age)) return "age must be a number";
  if (!patient.gender) return "gender is required";
  if (!patient.location) return "location is required";
  return null;
}

export function assertNoIdentifiableData(rawPatient) {
  if (hasIdentifiableKey(rawPatient) || hasIdentifiableValue(rawPatient)) {
    const error = new Error("Patient payload contains identifiable fields or values.");
    error.statusCode = 400;
    throw error;
  }

  const patient = normalizePatient(rawPatient);
  const fieldError = validateRequiredFields(patient);
  if (fieldError) {
    const error = new Error(fieldError);
    error.statusCode = 400;
    throw error;
  }

  return patient;
}

export function validateAnonymizedPatientPayload(req, _res, next) {
  try {
    const body = req.body || {};

    if (Array.isArray(body.patients)) {
      req.validatedPatients = body.patients.map(assertNoIdentifiableData);
      return next();
    }

    req.validatedPatient = assertNoIdentifiableData(body);
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAnonymizedUploadPayload(req, _res, next) {
  try {
    const rawPatients = parseUploadedPatients(req.file);
    req.validatedPatients = rawPatients.map(assertNoIdentifiableData);
    return next();
  } catch (error) {
    return next(error);
  }
}
