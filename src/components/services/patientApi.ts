import { Patient, PatientSaveResponse } from '@/types/patient';

const API_BASE = '/api';

export const patientApi = {
  /**
   * GET /api/patients - Fetch all patients
   */
  async getPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE}/patients`);
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * POST /api/patients - Save a new patient
   */
  async savePatient(patient: Omit<Patient, 'id'>): Promise<PatientSaveResponse> {
    const response = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patient),
    });
    if (!response.ok) {
      throw new Error(`Failed to save patient: ${response.statusText}`);
    }
    return response.json();
  },
};
