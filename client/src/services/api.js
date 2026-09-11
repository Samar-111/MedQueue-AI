import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeVoiceTriage = async (transcript, language) => {
  const response = await api.post('/api/triage/analyze', { transcript, language });
  return response.data;
};

export const fetchPatients = async () => {
  const response = await api.get('/api/patients');
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/api/patients', patientData);
  return response.data;
};

export const updatePatientStatus = async (id, statusData) => {
  const response = await api.patch(`/api/patients/${id}/status`, statusData);
  return response.data;
};

export const overridePatientESI = async (id, overrideData) => {
  const response = await api.patch(`/api/patients/${id}/override`, overrideData);
  return response.data;
};

export const chatFollowUpTriage = async (history, language) => {
  const response = await api.post('/api/triage/chat', { history, language });
  return response.data;
};

export const updatePatientVitals = async (id, vitals) => {
  const response = await api.patch(`/api/patients/${id}/vitals`, { vitals });
  return response.data;
};

export default api;
