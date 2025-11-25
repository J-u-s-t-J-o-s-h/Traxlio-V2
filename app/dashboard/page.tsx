'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GlobalSearch } from '@/components/GlobalSearch';
import { RoomCard } from '@/components/RoomCard';
import { RecentActivity } from '@/components/RecentActivity';
import { motion } from 'framer-motion';
import { Home, Box, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const router = useRouter();
  const { rooms, boxes, items, isLoading } = useInventory();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Rooms', value: rooms.length, icon: Home, color: 'from-blue-500 to-blue-600' },
    { label: 'Boxes', value: boxes.length, icon: Box, color: 'from-emerald-500 to-cyan-500' },
    { label: 'Items', value: items.length, icon: Package, color: 'from-violet-500 to-purple-600' },
  ];

  const recentRooms = rooms.slice(0, 3);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">Welcome back! Here's your inventory overview.</p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar - Prominent on Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8 relative z-20"
        >
          <Card className="p-2">
            <GlobalSearch 
              placeholder="Search for boxes, items, or tags..." 
              className="[&_input]:border-0 [&_input]:bg-transparent [&_input]:focus:ring-0"
            />
          </Card>
        </motion.div>

        {/* Stats - Compact on mobile, always 3 columns */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Card className="overflow-hidden p-0">
                <CardContent className="p-0">
                  <div className="flex flex-col items-center text-center p-3 sm:p-4 md:p-6">
                    <div className={`bg-gradient-to-br ${stat.color} p-2 sm:p-3 md:p-4 rounded-lg mb-2`}>
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Create new rooms, boxes, or jump to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => router.push('/rooms/new')}>
                <Home className="h-4 w-4 mr-2" />
                New Room
              </Button>
              <Button onClick={() => router.push('/boxes/new')} variant="secondary">
                <Box className="h-4 w-4 mr-2" />
                New Box
              </Button>
              <Button onClick={() => router.push('/rooms')} variant="outline">
                View All Rooms
              </Button>
            </CardContent>
          </Card>
          
          <RecentActivity limit={5} />
        </motion.div>

        {/* Recent Rooms */}
        {recentRooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Rooms</h2>
              <Button variant="ghost" onClick={() => router.push('/rooms')}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRooms.map((room, index) => {
                const boxCount = boxes.filter(b => b.roomId === room.id).length;
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    boxCount={boxCount}
                    index={index}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">No rooms yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Get started by creating your first room to organize your belongings.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/rooms/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Room
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Load Demo Data
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
