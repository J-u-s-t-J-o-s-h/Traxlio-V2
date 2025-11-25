'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { ItemCard } from '@/components/ItemCard';
import { DraggableItemCard } from '@/components/DraggableItemCard';
import { DroppableBoxZone } from '@/components/DroppableBoxZone';
import { ItemForm } from '@/components/ItemForm';
import { ShareDialog } from '@/components/ShareDialog';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'framer-motion';
import { Plus, Share2, Package, Search, QrCode, CheckSquare, X, Move, Home as HomeIcon, Box, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { ItemsPageSkeleton } from '@/components/ui/Skeleton';
import { QRCodeModal } from '@/components/QRCodeModal';
import { SortFilter, SortOption } from '@/components/SortFilter';
import { BulkMoveModal } from '@/components/BulkMoveModal';
import { Item } from '@/lib/types';

export default function BoxDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getBox, getRoom, boxes, getItemsByBox, createItem, updateItem, deleteItem, createShare, shares, isLoading } = useInventory();
  const { success } = useToast();
  const boxId = params.id as string;
  const box = getBox(boxId);
  const room = box ? getRoom(box.roomId) : null;
  const items = getItemsByBox(boxId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const sortOptions: SortOption[] = [
    { value: 'name', label: 'Name' },
    { value: 'created', label: 'Date Added' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'quantity', label: 'Quantity' },
  ];

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

  const filteredItems = items
    .filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleCreate = (data: any) => {
    createItem(boxId, data);
    success(`Item "${data.name}" created successfully`);
    setIsCreateModalOpen(false);
  };

  const handleEdit = (itemId: string) => {
    setEditingItem(itemId);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (data: any) => {
    if (editingItem) {
      updateItem(editingItem, data);
      success(`Item "${data.name}" updated successfully`);
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleDelete = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(itemId);
      success(`Item "${item?.name}" deleted`);
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredItems]);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkMoveComplete = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleShare = () => {
    const share = createShare('box', boxId);
    setIsShareModalOpen(true);
  };

  const handleDropItem = (itemId: string, targetBoxId: string) => {
    updateItem(itemId, { boxId: targetBoxId });
    const item = items.find(i => i.id === itemId);
    const targetBox = boxes.find(b => b.id === targetBoxId);
    if (item && targetBox) {
      success(`"${item.name}" moved to "${targetBox.name}"`);
    }
    setIsDragging(false);
  };

  const currentItem = editingItem ? items.find(i => i.id === editingItem) : null;
  const share = shares.find(s => s.type === 'box' && s.resourceId === boxId);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Rooms', href: '/rooms', icon: HomeIcon },
              { label: room.name, href: `/rooms/${room.id}` },
              { label: box.name, icon: Box },
            ]}
            className="mb-4"
          />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{box.name}</h1>
              {box.description && (
                <p className="text-base sm:text-lg text-slate-400 mb-2">{box.description}</p>
              )}
              <p className="text-sm text-slate-500">
                In <Link href={`/rooms/${room.id}`} className="text-emerald-400 hover:text-emerald-300 transition-colors">{room.name}</Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {items.length > 0 && boxes.length > 1 && (
                <Button
                  variant={dragMode ? 'secondary' : 'outline'}
                  onClick={() => {
                    setDragMode(!dragMode);
                    if (selectionMode) handleCancelSelection();
                  }}
                  className="w-full sm:w-auto"
                >
                  {dragMode ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Exit Drag
                    </>
                  ) : (
                    <>
                      <GripVertical className="h-4 w-4 mr-2" />
                      Drag & Drop
                    </>
                  )}
                </Button>
              )}
              {items.length > 0 && !dragMode && (
                <Button
                  variant={selectionMode ? 'secondary' : 'outline'}
                  onClick={() => selectionMode ? handleCancelSelection() : setSelectionMode(true)}
                  className="w-full sm:w-auto"
                >
                  {selectionMode ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsQRModalOpen(true)} className="w-full sm:w-auto">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {selectedItems.length} of {filteredItems.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsBulkMoveOpen(true)}
                  disabled={selectedItems.length === 0}
                  size="sm"
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move to Box
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
          <Input
            placeholder="Search items..."
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

        {/* Droppable zone for drag mode */}
        {dragMode && (
          <DroppableBoxZone
            boxes={boxes}
            currentBoxId={boxId}
            onDropItem={handleDropItem}
            isDragging={isDragging}
          />
        )}

        {isLoading ? (
          <ItemsPageSkeleton />
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No items found' : 'No items yet'}
            </h3>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first item in this box'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Item
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              dragMode ? (
                <DraggableItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  draggable={true}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                />
              ) : (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={selectionMode ? undefined : () => handleEdit(item.id)}
                  onDelete={selectionMode ? undefined : () => handleDelete(item.id)}
                  index={index}
                  selectable={selectionMode}
                  selected={selectedItems.some(i => i.id === item.id)}
                  onSelect={handleSelectItem}
                />
              )
            ))}
          </div>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Item"
          size="lg"
        >
          <ItemForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          title="Edit Item"
          size="lg"
        >
          {currentItem && (
            <ItemForm
              item={currentItem}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
              }}
            />
          )}
        </Modal>

        {share && (
          <ShareDialog
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            shareId={share.id}
            type="box"
            resourceName={box.name}
          />
        )}

        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          boxId={boxId}
          boxName={box.name}
        />

        <BulkMoveModal
          isOpen={isBulkMoveOpen}
          onClose={() => setIsBulkMoveOpen(false)}
          selectedItems={selectedItems}
          currentBoxId={boxId}
          onComplete={handleBulkMoveComplete}
        />
      </div>
    </div>
  );
}
