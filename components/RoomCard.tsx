'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { motion } from 'framer-motion';
import { Room } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Box, MoreVertical } from 'lucide-react';
import { Button } from './ui/Button';

interface RoomCardProps {
  room: Room;
  boxCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  boxCount,
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
        onClick={() => router.push(`/rooms/${room.id}`)}
        className="h-full"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{room.name}</CardTitle>
              {room.description && (
                <CardDescription className="mt-1">{room.description}</CardDescription>
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
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Box className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>{boxCount} {boxCount === 1 ? 'box' : 'boxes'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Updated {formatDate(room.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
