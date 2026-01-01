import React, { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { AddPatientForm } from '@/components/patients/AddPatientForm';
import { PatientList } from '@/components/patients/PatientList';

export function PatientsView() {
  const { patients, isLoading, error, addPatient, refreshPatients } = usePatients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPatient = async (patient: Parameters<typeof addPatient>[0]) => {
    setIsSubmitting(true);
    const result = await addPatient(patient);
    setIsSubmitting(false);
    return result;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AddPatientForm onSubmit={handleAddPatient} isSubmitting={isSubmitting} />
        </div>
        <div className="lg:col-span-2">
          <PatientList
            patients={patients}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshPatients}
          />
        </div>
      </div>
    </div>
  );
}
