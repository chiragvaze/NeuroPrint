import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000
});

export async function fetchTrialMatches() {
  const { data } = await api.get("/matching/trials");
  return data;
}

export async function createPatient(payload) {
  const { data } = await api.post("/patient/create", payload);
  return data;
}

export async function uploadPatientFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/patient/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
}

export async function fetchPatientById(id) {
  const { data } = await api.get(`/patient/${id}`);
  return data;
}

export async function createTrial(payload) {
  const { data } = await api.post("/trial/create", payload);
  return data;
}

export async function fetchAllTrials(filters = {}) {
  const { data } = await api.get("/trial/all", { params: filters });
  return data;
}

export async function fetchTrialById(id) {
  const { data } = await api.get(`/trial/${id}`);
  return data;
}

export async function importTrialJsonFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/trial/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
}

export default api;
