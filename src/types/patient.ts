export interface Patient {
  id?: number;      // Optional when sending new data
  name: string;
  age: number;
  phone: string;    // Optional field
}

export interface PatientSaveResponse {
  id: number;
  status: string;
}
