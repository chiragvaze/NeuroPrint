import {
  createPatient,
  createPatients,
  getPatientById
} from "../services/patientService.js";

export async function createPatientRecord(req, res, next) {
  try {
    const patient = await createPatient(req.validatedPatient);
    res.status(201).json({ patient });
  } catch (error) {
    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "patientId already exists.";
    }
    next(error);
  }
}

export async function uploadPatients(req, res, next) {
  try {
    const patients = await createPatients(req.validatedPatients);
    res.status(201).json({
      count: patients.length,
      patients
    });
  } catch (error) {
    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "One or more patientId values already exist.";
    }
    next(error);
  }
}

export async function getPatientRecord(req, res, next) {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    return res.status(200).json({ patient });
  } catch (error) {
    return next(error);
  }
}
