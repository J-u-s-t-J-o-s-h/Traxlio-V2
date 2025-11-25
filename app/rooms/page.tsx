'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { RoomCard } from '@/components/RoomCard';
import { RoomForm } from '@/components/RoomForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Plus, Search, Home } from 'lucide-react';
import Link from 'next/link';
import { RoomsPageSkeleton } from '@/components/ui/Skeleton';
import { SortFilter, SortOption } from '@/components/SortFilter';

export default function RoomsPage() {
  const router = useRouter();
  const { rooms, boxes, createRoom, updateRoom, deleteRoom, isLoading } = useInventory();
  const { success } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Name' },
    { value: 'created', label: 'Date Created' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'boxes', label: 'Box Count' },
  ];

  const filteredRooms = rooms
    .filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'boxes':
          const aBoxes = boxes.filter(box => box.roomId === a.id).length;
          const bBoxes = boxes.filter(box => box.roomId === b.id).length;
          comparison = aBoxes - bBoxes;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleCreate = (data: { name: string; description?: string }) => {
    createRoom(data.name, data.description);
    success(`Room "${data.name}" created successfully`);
    setIsCreateModalOpen(false);
  };

  const handleEdit = (roomId: string) => {
    setEditingRoom(roomId);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: { name: string; description?: string }) => {
    if (editingRoom) {
      updateRoom(editingRoom, data);
      success(`Room "${data.name}" updated successfully`);
      setIsEditModalOpen(false);
      setEditingRoom(null);
    }
  };

  const handleDelete = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (confirm('Are you sure you want to delete this room? All boxes and items in this room will also be deleted.')) {
      deleteRoom(roomId);
      success(`Room "${room?.name}" deleted`);
    }
  };

  const currentRoom = editingRoom ? rooms.find(r => r.id === editingRoom) : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div>
              <Link href="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-2 inline-block transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                Rooms & Locations
              </h1>
              <p className="text-base sm:text-lg text-slate-400 mt-1">Organize your belongings by location</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Room
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              />
            </div>
            <SortFilter
              sortOptions={sortOptions}
              currentSort={sortBy}
              sortDirection={sortDirection}
              onSortChange={setSortBy}
              onDirectionChange={setSortDirection}
            />
          </div>
        </div>

        {isLoading ? (
          <RoomsPageSkeleton />
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No rooms yet</h3>
            <p className="text-slate-400 mb-4">Create your first room to get started</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room, index) => {
              const boxCount = boxes.filter(b => b.roomId === room.id).length;
              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  boxCount={boxCount}
                  onEdit={() => handleEdit(room.id)}
                  onDelete={() => handleDelete(room.id)}
                  index={index}
                />
              );
            })}
          </div>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Room"
        >
          <RoomForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingRoom(null);
          }}
          title="Edit Room"
        >
          {currentRoom && (
            <RoomForm
              room={currentRoom}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingRoom(null);
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
