'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from './ui/Input';
import { ImageUpload } from './ui/ImageUpload';
import { Button } from './ui/Button';
import { Item } from '@/lib/types';
import { X } from 'lucide-react';

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: ItemFormData & { images: string[]; tags: string[] }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [tags, setTags] = useState<string[]>(item?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: item ? {
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      notes: item.notes || '',
    } : {
      quantity: 1,
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit({ ...data, images, tags }))}
      className="space-y-4"
    >
      <Input
        label="Item Name"
        {...register('name')}
        error={errors.name?.message}
        placeholder="e.g., Laptop, Winter Jacket, Camera"
      />
      <Textarea
        label="Description (optional)"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Add a description..."
        rows={3}
      />
      <Input
        label="Quantity"
        type="number"
        {...register('quantity', { valueAsNumber: true })}
        error={errors.quantity?.message}
        min={1}
      />
      <ImageUpload
        label="Images"
        images={images}
        onChange={setImages}
        maxImages={5}
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded-md"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Textarea
        label="Notes (optional)"
        {...register('notes')}
        error={errors.notes?.message}
        placeholder="Add any additional notes..."
        rows={3}
      />
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};

