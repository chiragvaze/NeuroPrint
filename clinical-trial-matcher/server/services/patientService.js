import Patient from "../models/Patient.js";

export async function createPatient(patientPayload) {
  const patient = await Patient.create(patientPayload);
  return patient;
}

export async function createPatients(patientPayloadList) {
  const patients = await Patient.insertMany(patientPayloadList, { ordered: false });
  return patients;
}

export async function getPatientById(id) {
  const byPatientId = await Patient.findOne({ patientId: id }).lean();
  if (byPatientId) return byPatientId;

  // Fallback allows lookup by Mongo _id while preserving :id route.
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    return Patient.findById(id).lean();
  }

  return null;
}
