import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, AlertCircle } from 'lucide-react';
import { Patient } from '@/types/patient';

interface PatientListProps {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function PatientList({ patients, isLoading, error, onRefresh }: PatientListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Patient List
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading patients...
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No patients found. Add a new patient to get started.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-4 p-3 bg-muted rounded-lg font-medium text-sm">
              <span>ID</span>
              <span>Name</span>
              <span>Age</span>
              <span>Phone</span>
            </div>
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="grid grid-cols-4 gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-muted-foreground">#{patient.id}</span>
                <span className="font-medium">{patient.name}</span>
                <span>{patient.age}</span>
                <span className="text-muted-foreground">
                  {patient.phone || '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
