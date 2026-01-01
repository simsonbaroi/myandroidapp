import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { Patient } from '@/types/patient';

interface AddPatientFormProps {
  onSubmit: (patient: Omit<Patient, 'id'>) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function AddPatientForm({ onSubmit, isSubmitting }: AddPatientFormProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      newErrors.age = 'Valid age is required (0-150)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const patient: Omit<Patient, 'id'> = {
      name: name.trim(),
      age: parseInt(age, 10),
      phone: phone.trim(),
    };

    const success = await onSubmit(patient);
    if (success) {
      // Reset form
      setName('');
      setAge('');
      setPhone('');
      setErrors({});
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Patient
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter patient name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              min="0"
              max="150"
              disabled={isSubmitting}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Patient'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
