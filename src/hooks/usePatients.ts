import { useState, useEffect, useCallback } from 'react';
import { Patient } from '@/types/patient';
import { patientApi } from '@/services/patientApi';
import { toast } from 'sonner';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientApi.getPatients();
      setPatients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch patients';
      setError(message);
      console.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id'>) => {
    try {
      const response = await patientApi.savePatient(patient);
      if (response.status === 'saved') {
        toast.success(`Patient saved with ID: ${response.id}`);
        // Refresh the list
        await fetchPatients();
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save patient';
      toast.error(message);
      console.error('Error saving patient:', err);
      return false;
    }
  }, [fetchPatients]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    isLoading,
    error,
    addPatient,
    refreshPatients: fetchPatients,
  };
}
