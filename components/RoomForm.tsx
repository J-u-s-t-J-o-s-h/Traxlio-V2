'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';
import { Room } from '@/lib/types';

const roomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormProps {
  room?: Room;
  onSubmit: (data: RoomFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: room ? {
      name: room.name,
      description: room.description || '',
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Room Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="e.g., Living Room, Garage, Storage Unit"
      />
      <Textarea
        label="Description (optional)"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Add any notes about this room..."
        rows={3}
      />
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {room ? 'Update Room' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
};

