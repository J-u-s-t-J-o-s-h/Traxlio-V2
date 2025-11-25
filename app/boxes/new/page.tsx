'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { BoxForm } from '@/components/BoxForm';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function NewBoxPage() {
  const router = useRouter();
  const { rooms, createBox } = useInventory();
  const { success } = useToast();

  const handleSubmit = async (data: { roomId: string; name: string; description?: string }) => {
    const box = await createBox(data.roomId, data.name, data.description);
    success(`Box "${box.name}" created successfully`);
    router.push(`/boxes/${box.id}`);
  };

  if (rooms.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 inline-block transition-colors">
            ← Back to Dashboard
          </Link>
          <Card>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Create New Box</h1>
            <p className="text-slate-400 mb-4">You need to create a room first before creating a box.</p>
            <Link href="/rooms/new" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Create a room →
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 inline-block transition-colors">
          ← Back to Dashboard
        </Link>
        <Card>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Create New Box</h1>
          <BoxForm
            rooms={rooms}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/dashboard')}
          />
        </Card>
      </div>
    </div>
  );
}
