'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BoxCard } from '@/components/BoxCard';
import { ItemCard } from '@/components/ItemCard';
import { motion } from 'framer-motion';
import { Home, Box, Package } from 'lucide-react';

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const { getShare, getRoom, getBox, getItem, getBoxesByRoom, getItemsByBox, items } = useInventory();
  const share = getShare(shareId);

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Share not found</h2>
          <p className="text-slate-400">This share link may have expired or been deleted.</p>
        </div>
      </div>
    );
  }

  const renderSharedContent = () => {
    if (share.type === 'room') {
      const room = getRoom(share.resourceId);
      if (!room) return <div className="text-white">Room not found</div>;
      const boxes = getBoxesByRoom(room.id);

      return (
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{room.name}</h1>
                {room.description && (
                  <p className="text-lg text-slate-400 mt-1">{room.description}</p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-400">
              Shared Room
            </span>
          </motion.div>

          {boxes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Box className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No boxes in this room</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxes.map((box, index) => {
                const itemCount = items.filter(i => i.boxId === box.id).length;
                return (
                  <BoxCard
                    key={box.id}
                    box={box}
                    itemCount={itemCount}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (share.type === 'box') {
      const box = getBox(share.resourceId);
      if (!box) return <div className="text-white">Box not found</div>;
      const room = getRoom(box.roomId);
      const boxItems = getItemsByBox(box.id);

      return (
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{box.name}</h1>
                {box.description && (
                  <p className="text-lg text-slate-400 mt-1">{box.description}</p>
                )}
                {room && (
                  <p className="text-sm text-slate-500 mt-1">In {room.name}</p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-400">
              Shared Box
            </span>
          </motion.div>

          {boxItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No items in this box</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boxItems.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (share.type === 'item') {
      const item = getItem(share.resourceId);
      if (!item) return <div className="text-white">Item not found</div>;
      const box = getBox(item.boxId);
      const room = box ? getRoom(box.roomId) : null;

      return (
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{item.name}</h1>
                {item.description && (
                  <p className="text-lg text-slate-400 mt-1">{item.description}</p>
                )}
                {box && room && (
                  <p className="text-sm text-slate-500 mt-1">
                    In {box.name} • {room.name}
                  </p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-400">
              Shared Item
            </span>
          </motion.div>

          <div className="max-w-2xl">
            <ItemCard item={item} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSharedContent()}
      </div>
    </div>
  );
}
