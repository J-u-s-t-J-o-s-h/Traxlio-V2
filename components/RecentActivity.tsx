'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowRightLeft,
  Home,
  Box,
  Package,
  Clock
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Activity } from '@/lib/types';

const getActionIcon = (action: Activity['action']) => {
  switch (action) {
    case 'create':
      return Plus;
    case 'update':
      return Pencil;
    case 'delete':
      return Trash2;
    case 'move':
      return ArrowRightLeft;
  }
};

const getActionColor = (action: Activity['action']) => {
  switch (action) {
    case 'create':
      return 'text-emerald-500 bg-emerald-500/10';
    case 'update':
      return 'text-blue-500 bg-blue-500/10';
    case 'delete':
      return 'text-red-500 bg-red-500/10';
    case 'move':
      return 'text-purple-500 bg-purple-500/10';
  }
};

const getTypeIcon = (type: Activity['type']) => {
  switch (type) {
    case 'room':
      return Home;
    case 'box':
      return Box;
    case 'item':
      return Package;
  }
};

const getActionText = (action: Activity['action']) => {
  switch (action) {
    case 'create':
      return 'Created';
    case 'update':
      return 'Updated';
    case 'delete':
      return 'Deleted';
    case 'move':
      return 'Moved';
  }
};

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
};

interface RecentActivityProps {
  limit?: number;
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  limit = 8,
  className 
}) => {
  const { getRecentActivities } = useInventory();
  const activities = getRecentActivities(limit);

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Your actions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {activities.map((activity, index) => {
            const ActionIcon = getActionIcon(activity.action);
            const TypeIcon = getTypeIcon(activity.type);
            const actionColor = getActionColor(activity.action);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className={cn('p-1.5 rounded-lg', actionColor)}>
                  <ActionIcon className="h-3.5 w-3.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {getActionText(activity.action)}
                    </span>
                    <TypeIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm text-slate-900 dark:text-white font-medium truncate">
                      {activity.resourceName}
                    </span>
                  </div>
                  {activity.parentName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.action === 'move' ? 'to' : 'in'} {activity.parentName}
                    </p>
                  )}
                </div>
                
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {getRelativeTime(activity.timestamp)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

