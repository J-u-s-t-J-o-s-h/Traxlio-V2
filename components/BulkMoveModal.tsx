'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Package } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Dropdown } from './ui/Dropdown';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from './ui/Toast';
import { Item } from '@/lib/types';

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Item[];
  currentBoxId: string;
  onComplete: () => void;
}

export const BulkMoveModal: React.FC<BulkMoveModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  currentBoxId,
  onComplete,
}) => {
  const { boxes, rooms, getRoom, updateItem } = useInventory();
  const { success } = useToast();
  const [targetBoxId, setTargetBoxId] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  // Get boxes that are not the current box
  const availableBoxes = boxes.filter(box => box.id !== currentBoxId);

  const boxOptions = availableBoxes.map(box => {
    const room = getRoom(box.roomId);
    return {
      value: box.id,
      label: `${box.name} (${room?.name || 'Unknown Room'})`,
    };
  });

  const handleMove = async () => {
    if (!targetBoxId || selectedItems.length === 0) return;

    setIsMoving(true);
    
    // Move all items to the target box
    selectedItems.forEach(item => {
      updateItem(item.id, { boxId: targetBoxId });
    });

    const targetBox = boxes.find(b => b.id === targetBoxId);
    success(`Moved ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} to "${targetBox?.name}"`);
    
    setIsMoving(false);
    setTargetBoxId('');
    onComplete();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Items" size="md">
      <div className="space-y-6">
        {/* Selected Items Preview */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Selected Items ({selectedItems.length})
          </h3>
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {selectedItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Package className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-slate-500">×{item.quantity}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Move Indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Box className="h-6 w-6 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current Box</p>
          </div>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <ArrowRight className="h-6 w-6 text-emerald-500" />
          </motion.div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Box className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Target Box</p>
          </div>
        </div>

        {/* Target Box Selection */}
        <Dropdown
          label="Move to Box"
          options={boxOptions}
          value={targetBoxId}
          onChange={setTargetBoxId}
          placeholder="Select a box..."
        />

        {availableBoxes.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
            No other boxes available. Create another box first.
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!targetBoxId || isMoving}
            isLoading={isMoving}
          >
            Move {selectedItems.length} Item{selectedItems.length > 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

