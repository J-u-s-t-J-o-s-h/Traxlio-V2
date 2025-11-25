'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { BoxCard } from '@/components/BoxCard';
import { BoxForm } from '@/components/BoxForm';
import { ShareDialog } from '@/components/ShareDialog';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { Plus, Share2, Box, Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { BoxesPageSkeleton } from '@/components/ui/Skeleton';

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRoom, getBoxesByRoom, items, createBox, updateBox, deleteBox, createShare, shares, isLoading } = useInventory();
  const { success } = useToast();
  const roomId = params.id as string;
  const room = getRoom(roomId);
  const boxes = getBoxesByRoom(roomId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<string | null>(null);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Room not found</h2>
          <Link href="/rooms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Go back to rooms
          </Link>
        </div>
      </div>
    );
  }

  const handleCreate = (data: { roomId: string; name: string; description?: string }) => {
    createBox(data.roomId, data.name, data.description);
    success(`Box "${data.name}" created successfully`);
    setIsCreateModalOpen(false);
  };

  const handleEdit = (boxId: string) => {
    setEditingBox(boxId);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: { roomId: string; name: string; description?: string }) => {
    if (editingBox) {
      updateBox(editingBox, data);
      success(`Box "${data.name}" updated successfully`);
      setIsEditModalOpen(false);
      setEditingBox(null);
    }
  };

  const handleDelete = (boxId: string) => {
    const box = boxes.find(b => b.id === boxId);
    if (confirm('Are you sure you want to delete this box? All items in this box will also be deleted.')) {
      deleteBox(boxId);
      success(`Box "${box?.name}" deleted`);
    }
  };

  const handleShare = () => {
    const share = createShare('room', roomId);
    setIsShareModalOpen(true);
  };

  const currentBox = editingBox ? boxes.find(b => b.id === editingBox) : null;
  const share = shares.find(s => s.type === 'room' && s.resourceId === roomId);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Rooms', href: '/rooms', icon: HomeIcon },
              { label: room.name },
            ]}
            className="mb-4"
          />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{room.name}</h1>
              {room.description && (
                <p className="text-base sm:text-lg text-slate-400">{room.description}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Box
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <BoxesPageSkeleton />
        ) : boxes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Box className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No boxes yet</h3>
            <p className="text-slate-400 mb-4">Create your first box in this room</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Box
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box, index) => {
              const itemCount = items.filter(i => i.boxId === box.id).length;
              return (
                <BoxCard
                  key={box.id}
                  box={box}
                  itemCount={itemCount}
                  onEdit={() => handleEdit(box.id)}
                  onDelete={() => handleDelete(box.id)}
                  index={index}
                />
              );
            })}
          </div>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Box"
        >
          <BoxForm
            rooms={[room]}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBox(null);
          }}
          title="Edit Box"
        >
          {currentBox && (
            <BoxForm
              box={currentBox}
              rooms={[room]}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingBox(null);
              }}
            />
          )}
        </Modal>

        {share && (
          <ShareDialog
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            shareId={share.id}
            type="room"
            resourceName={room.name}
          />
        )}
      </div>
    </div>
  );
}
