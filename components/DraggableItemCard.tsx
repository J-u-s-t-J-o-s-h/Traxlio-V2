'use client';

import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { motion } from 'framer-motion';
import { Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tag, Check, ImageIcon, Images, GripVertical } from 'lucide-react';
import { Button } from './ui/Button';

interface DraggableItemCardProps {
  item: Item;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (item: Item) => void;
  draggable?: boolean;
  onDragStart?: (item: Item) => void;
  onDragEnd?: () => void;
}

export const DraggableItemCard: React.FC<DraggableItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  index = 0,
  selectable = false,
  selected = false,
  onSelect,
  draggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(item);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ itemId: item.id, itemName: item.name }));
    e.dataTransfer.effectAllowed = 'move';
    if (cardRef.current) {
      cardRef.current.style.opacity = '0.5';
    }
    onDragStart?.(item);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      cardRef.current.style.opacity = '1';
    }
    onDragEnd?.();
  };

  // Draggable mode
  if (draggable) {
    return (
      <div
        ref={cardRef}
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'backdrop-blur-sm rounded-xl border shadow-lg transition-all duration-200',
          'bg-white/80 border-slate-200',
          'dark:bg-slate-800/50 dark:border-slate-700/50',
          'h-full cursor-grab active:cursor-grabbing',
          'hover:border-emerald-400 hover:shadow-emerald-500/20',
          'select-none'
        )}
        style={{ touchAction: 'none' }}
      >
        {/* Drag Handle Bar - Large touch target */}
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-t-xl px-4 py-3 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Drag to move</span>
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
            )}
          </div>

          {/* Image */}
          {item.images && item.images.length > 0 ? (
            <div className="mb-4 h-32 w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
          ) : (
            <div className="mb-4 h-20 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-5 w-5 text-slate-300 dark:text-slate-500 mx-auto mb-1" />
                <span className="text-xs text-slate-400 dark:text-slate-500">No image</span>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Quantity:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.quantity}</span>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-600"
                  >
                    <Tag className="h-3 w-3 text-cyan-500 dark:text-cyan-400" />
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Non-draggable mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={handleClick}
      className={cn(selectable && 'cursor-pointer')}
    >
      <Card className={cn(
        'h-full transition-all',
        selectable && 'hover:border-emerald-500/50',
        selected && 'border-emerald-500 ring-2 ring-emerald-500/30'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {selectable && (
                <div
                  className={cn(
                    'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                    selected
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-400 dark:border-slate-600'
                  )}
                >
                  {selected && <Check className="h-4 w-4 text-white" />}
                </div>
              )}
              <div className="flex-1">
                <CardTitle>{item.name}</CardTitle>
                {item.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                )}
              </div>
            </div>
            {!selectable && (onEdit || onDelete) && (
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {item.images && item.images.length > 0 && (
            <div className="mb-4">
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 group">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                    <Images className="h-3 w-3" />
                    <span>{item.images.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {(!item.images || item.images.length === 0) && (
            <div className="mb-4 h-20 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700/50 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-5 w-5 text-slate-300 dark:text-slate-500 mx-auto mb-1" />
                <span className="text-xs text-slate-400 dark:text-slate-500">No image</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Quantity:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.quantity}</span>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-600"
                  >
                    <Tag className="h-3 w-3 text-cyan-500 dark:text-cyan-400" />
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
