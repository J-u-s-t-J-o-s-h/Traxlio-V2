'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { BoxForm, BoxFormSubmitData } from '@/components/BoxForm';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function EditBoxPage() {
  const params = useParams();
  const router = useRouter();
  const { getBox, getRoom, rooms, updateBox } = useInventory();
  const { success } = useToast();
  const boxId = params.id as string;
  const box = getBox(boxId);
  const room = box ? getRoom(box.roomId) : null;

  if (!box || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Box not found</h2>
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: BoxFormSubmitData) => {
    await updateBox(boxId, {
      roomId: data.roomId,
      name: data.name,
      description: data.description,
      image: data.image,
    });
    success(`Box "${data.name}" updated successfully`);
    router.push(`/boxes/${boxId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/boxes/${boxId}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 inline-block transition-colors">
          ← Back to Box
        </Link>
        <Card>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Edit Box</h1>
          <BoxForm
            box={box}
            rooms={rooms}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/boxes/${boxId}`)}
          />
        </Card>
      </div>
    </div>
  );
}
