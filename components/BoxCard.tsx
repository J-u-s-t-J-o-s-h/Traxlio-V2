'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { motion } from 'framer-motion';
import { Box } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Package, ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface BoxCardProps {
  box: Box;
  itemCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export const BoxCard: React.FC<BoxCardProps> = ({
  box,
  itemCount,
  onEdit,
  onDelete,
  index = 0,
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        hover
        onClick={() => router.push(`/boxes/${box.id}`)}
        className="h-full overflow-hidden"
      >
        {/* Box Image */}
        {box.image ? (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={box.image}
              alt={box.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        
        <CardHeader className="pt-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{box.name}</CardTitle>
              {box.description && (
                <CardDescription className="mt-1 line-clamp-2">{box.description}</CardDescription>
              )}
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Package className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Updated {formatDate(box.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
