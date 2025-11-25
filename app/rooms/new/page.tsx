'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { RoomForm } from '@/components/RoomForm';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function NewRoomPage() {
  const router = useRouter();
  const { createRoom } = useInventory();
  const { success } = useToast();

  const handleSubmit = (data: { name: string; description?: string }) => {
    const room = createRoom(data.name, data.description);
    success(`Room "${room.name}" created successfully`);
    router.push(`/rooms/${room.id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/rooms" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4 inline-block transition-colors">
          ← Back to Rooms
        </Link>
        <Card>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Create New Room</h1>
          <RoomForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/rooms')}
          />
        </Card>
      </div>
    </div>
  );
}
