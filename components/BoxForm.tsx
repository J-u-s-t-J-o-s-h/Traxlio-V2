'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from './ui/Input';
import { Dropdown } from './ui/Dropdown';
import { Button } from './ui/Button';
import { SingleImageUpload } from './ui/ImageUpload';
import { Box, Room } from '@/lib/types';

const boxSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type BoxFormData = z.infer<typeof boxSchema>;

export interface BoxFormSubmitData extends BoxFormData {
  image?: string;
}

interface BoxFormProps {
  box?: Box;
  rooms: Room[];
  onSubmit: (data: BoxFormSubmitData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BoxForm: React.FC<BoxFormProps> = ({
  box,
  rooms,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [image, setImage] = useState<string | undefined>(box?.image);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BoxFormData>({
    resolver: zodResolver(boxSchema),
    defaultValues: box ? {
      roomId: box.roomId,
      name: box.name,
      description: box.description || '',
    } : undefined,
  });

  const roomId = watch('roomId');

  const roomOptions = rooms.map(room => ({
    value: room.id,
    label: room.name,
  }));

  const handleFormSubmit = (data: BoxFormData) => {
    onSubmit({
      ...data,
      image,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <SingleImageUpload
        image={image}
        onChange={setImage}
        label="Box Photo (optional)"
      />
      <Dropdown
        label="Room"
        options={roomOptions}
        value={roomId}
        onChange={(value) => setValue('roomId', value)}
        error={errors.roomId?.message}
        placeholder="Select a room"
      />
      <Input
        label="Box Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="e.g., Box 1, Electronics Box, Winter Clothes"
      />
      <Textarea
        label="Description (optional)"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Add any notes about this box..."
        rows={3}
      />
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {box ? 'Update Box' : 'Create Box'}
        </Button>
      </div>
    </form>
  );
};
