'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Room, Box, Item, Share, Activity, InventoryData } from '@/lib/types';
import { storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface InventoryContextType {
  rooms: Room[];
  boxes: Box[];
  items: Item[];
  shares: Share[];
  activities: Activity[];
  isLoading: boolean;
  
  // Room operations
  createRoom: (name: string, description?: string) => Room;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getRoom: (id: string) => Room | undefined;
  
  // Box operations
  createBox: (roomId: string, name: string, description?: string) => Box;
  updateBox: (id: string, updates: Partial<Box>) => void;
  deleteBox: (id: string) => void;
  getBox: (id: string) => Box | undefined;
  getBoxesByRoom: (roomId: string) => Box[];
  
  // Item operations
  createItem: (boxId: string, data: Omit<Item, 'id' | 'boxId' | 'createdAt' | 'updatedAt'>) => Item;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => Item | undefined;
  getItemsByBox: (boxId: string) => Item[];
  
  // Share operations
  createShare: (type: 'room' | 'box' | 'item', resourceId: string, isPublic?: boolean) => Share;
  getShare: (shareId: string) => Share | null;
  deleteShare: (shareId: string) => void;
  
  // Activity operations
  getRecentActivities: (limit?: number) => Activity[];
  
  // Refresh
  refresh: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<InventoryData>({ rooms: [], boxes: [], items: [], shares: [], activities: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Helper to log activity
  const logActivity = useCallback((action: Activity['action'], type: Activity['type'], resourceId: string, resourceName: string, parentName?: string) => {
    const activity: Activity = {
      id: uuidv4(),
      action,
      type,
      resourceId,
      resourceName,
      parentName,
      timestamp: new Date(),
    };
    storage.addActivity(activity);
  }, []);

  const loadData = useCallback(() => {
    const inventory = storage.getInventory();
    setData(inventory);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Simulate brief load to show skeleton (can be removed in production)
    const timer = setTimeout(() => {
    loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Room operations
  const createRoom = useCallback((name: string, description?: string): Room => {
    const room: Room = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    storage.addRoom(room);
    logActivity('create', 'room', room.id, name);
    refresh();
    return room;
  }, [refresh, logActivity]);

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    const room = data.rooms.find(r => r.id === id);
    storage.updateRoom(id, updates);
    if (room) logActivity('update', 'room', id, updates.name || room.name);
    refresh();
  }, [refresh, logActivity, data.rooms]);

  const deleteRoom = useCallback((id: string) => {
    const room = data.rooms.find(r => r.id === id);
    storage.deleteRoom(id);
    if (room) logActivity('delete', 'room', id, room.name);
    refresh();
  }, [refresh, logActivity, data.rooms]);

  const getRoom = useCallback((id: string) => {
    return data.rooms.find(r => r.id === id);
  }, [data.rooms]);

  // Box operations
  const createBox = useCallback((roomId: string, name: string, description?: string): Box => {
    const box: Box = {
      id: uuidv4(),
      roomId,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const room = data.rooms.find(r => r.id === roomId);
    storage.addBox(box);
    logActivity('create', 'box', box.id, name, room?.name);
    refresh();
    return box;
  }, [refresh, logActivity, data.rooms]);

  const updateBox = useCallback((id: string, updates: Partial<Box>) => {
    const box = data.boxes.find(b => b.id === id);
    const room = box ? data.rooms.find(r => r.id === box.roomId) : null;
    storage.updateBox(id, updates);
    if (box) logActivity('update', 'box', id, updates.name || box.name, room?.name);
    refresh();
  }, [refresh, logActivity, data.boxes, data.rooms]);

  const deleteBox = useCallback((id: string) => {
    const box = data.boxes.find(b => b.id === id);
    const room = box ? data.rooms.find(r => r.id === box.roomId) : null;
    storage.deleteBox(id);
    if (box) logActivity('delete', 'box', id, box.name, room?.name);
    refresh();
  }, [refresh, logActivity, data.boxes, data.rooms]);

  const getBox = useCallback((id: string) => {
    return data.boxes.find(b => b.id === id);
  }, [data.boxes]);

  const getBoxesByRoom = useCallback((roomId: string) => {
    return data.boxes.filter(b => b.roomId === roomId);
  }, [data.boxes]);

  // Item operations
  const createItem = useCallback((boxId: string, itemData: Omit<Item, 'id' | 'boxId' | 'createdAt' | 'updatedAt'>): Item => {
    const item: Item = {
      id: uuidv4(),
      boxId,
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const box = data.boxes.find(b => b.id === boxId);
    storage.addItem(item);
    logActivity('create', 'item', item.id, itemData.name, box?.name);
    refresh();
    return item;
  }, [refresh, logActivity, data.boxes]);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    const item = data.items.find(i => i.id === id);
    const box = item ? data.boxes.find(b => b.id === item.boxId) : null;
    // Check if this is a move operation (boxId changed)
    const isMove = updates.boxId && item && updates.boxId !== item.boxId;
    storage.updateItem(id, updates);
    if (item) {
      if (isMove) {
        const newBox = data.boxes.find(b => b.id === updates.boxId);
        logActivity('move', 'item', id, item.name, newBox?.name);
      } else {
        logActivity('update', 'item', id, updates.name || item.name, box?.name);
      }
    }
    refresh();
  }, [refresh, logActivity, data.items, data.boxes]);

  const deleteItem = useCallback((id: string) => {
    const item = data.items.find(i => i.id === id);
    const box = item ? data.boxes.find(b => b.id === item.boxId) : null;
    storage.deleteItem(id);
    if (item) logActivity('delete', 'item', id, item.name, box?.name);
    refresh();
  }, [refresh, logActivity, data.items, data.boxes]);

  const getItem = useCallback((id: string) => {
    return data.items.find(i => i.id === id);
  }, [data.items]);

  const getItemsByBox = useCallback((boxId: string) => {
    return data.items.filter(i => i.boxId === boxId);
  }, [data.items]);

  // Share operations
  const createShare = useCallback((type: 'room' | 'box' | 'item', resourceId: string, isPublic = true): Share => {
    const share: Share = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      type,
      resourceId,
      isPublic,
      createdAt: new Date(),
    };
    storage.addShare(share);
    refresh();
    return share;
  }, [refresh]);

  const getShare = useCallback((shareId: string) => {
    return storage.getShare(shareId);
  }, []);

  const deleteShare = useCallback((shareId: string) => {
    storage.deleteShare(shareId);
    refresh();
  }, [refresh]);

  // Activity operations
  const getRecentActivities = useCallback((limit: number = 10): Activity[] => {
    return data.activities.slice(0, limit);
  }, [data.activities]);

  const value: InventoryContextType = {
    rooms: data.rooms,
    boxes: data.boxes,
    items: data.items,
    shares: data.shares,
    activities: data.activities,
    isLoading,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoom,
    createBox,
    updateBox,
    deleteBox,
    getBox,
    getBoxesByRoom,
    createItem,
    updateItem,
    deleteItem,
    getItem,
    getItemsByBox,
    createShare,
    getShare,
    deleteShare,
    getRecentActivities,
    refresh,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

