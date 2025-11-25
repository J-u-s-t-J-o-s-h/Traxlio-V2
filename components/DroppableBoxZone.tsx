'use client';

import React, { useState } from 'react';
import { Box } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Package, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DroppableBoxZoneProps {
  boxes: Box[];
  currentBoxId: string;
  onDropItem: (itemId: string, targetBoxId: string) => void;
  isDragging: boolean;
  className?: string;
}

export const DroppableBoxZone: React.FC<DroppableBoxZoneProps> = ({
  boxes,
  currentBoxId,
  onDropItem,
  isDragging,
  className,
}) => {
  const [dragOverBoxId, setDragOverBoxId] = useState<string | null>(null);
  const [droppedBoxId, setDroppedBoxId] = useState<string | null>(null);

  const otherBoxes = boxes.filter(box => box.id !== currentBoxId);

  const handleDragOver = (e: React.DragEvent, boxId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBoxId(boxId);
  };

  const handleDragLeave = () => {
    setDragOverBoxId(null);
  };

  const handleDrop = (e: React.DragEvent, targetBoxId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const itemId = data.itemId;
    
    setDragOverBoxId(null);
    setDroppedBoxId(targetBoxId);
    
    onDropItem(itemId, targetBoxId);
    
    // Reset dropped state after animation
    setTimeout(() => setDroppedBoxId(null), 1000);
  };

  return (
    <AnimatePresence>
      {isDragging && otherBoxes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={cn('mb-6', className)}
        >
          <div className="border-2 border-dashed border-emerald-500/50 rounded-xl p-4 bg-emerald-50/50 dark:bg-emerald-900/10">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Drop to move to another box
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {otherBoxes.map((box) => (
                <div
                  key={box.id}
                  onDragOver={(e) => handleDragOver(e, box.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, box.id)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                    dragOverBoxId === box.id
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 scale-105'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700',
                    droppedBoxId === box.id && 'border-green-500 bg-green-100 dark:bg-green-900/40'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {droppedBoxId === box.id ? (
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                        dragOverBoxId === box.id
                          ? 'bg-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-700'
                      )}>
                        <Package className={cn(
                          'h-4 w-4',
                          dragOverBoxId === box.id
                            ? 'text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        )} />
                      </div>
                    )}
                    <span className={cn(
                      'text-sm font-medium truncate',
                      dragOverBoxId === box.id
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {box.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
