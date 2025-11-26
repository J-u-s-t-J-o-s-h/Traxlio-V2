'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Room, Box, Item, Share, Activity, InventoryData } from '@/lib/types';
import { storage } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface InventoryContextType {
  rooms: Room[];
  boxes: Box[];
  items: Item[];
  shares: Share[];
  activities: Activity[];
  isLoading: boolean;
  isUsingSupabase: boolean;
  
  // Room operations
  createRoom: (name: string, description?: string) => Promise<Room>;
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  getRoom: (id: string) => Room | undefined;
  
  // Box operations
  createBox: (roomId: string, name: string, description?: string, image?: string) => Promise<Box>;
  updateBox: (id: string, updates: Partial<Box>) => Promise<void>;
  deleteBox: (id: string) => Promise<void>;
  getBox: (id: string) => Box | undefined;
  getBoxesByRoom: (roomId: string) => Box[];
  
  // Item operations
  createItem: (boxId: string, data: Omit<Item, 'id' | 'boxId' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => Item | undefined;
  getItemsByBox: (boxId: string) => Item[];
  
  // Share operations
  createShare: (type: 'room' | 'box' | 'item', resourceId: string, isPublic?: boolean) => Promise<Share>;
  getShare: (shareId: string) => Share | null;
  deleteShare: (shareId: string) => Promise<void>;
  
  // Activity operations
  getRecentActivities: (limit?: number) => Activity[];
  
  // Refresh
  refresh: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth();
  const [data, setData] = useState<InventoryData>({ rooms: [], boxes: [], items: [], shares: [], activities: [] });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Only use Supabase if it's configured and user is logged in
  const isUsingSupabase = !!(user && supabase && isConfigured);

  // Transform Supabase data to app format
  const transformRoom = (row: any): Room => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  const transformBox = (row: any): Box => ({
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    description: row.description,
    image: row.image,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  const transformItem = (row: any): Item => ({
    id: row.id,
    boxId: row.box_id,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    images: row.images || [],
    tags: row.tags || [],
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  const transformShare = (row: any): Share => ({
    id: row.id,
    type: row.type,
    resourceId: row.resource_id,
    isPublic: row.is_public,
    createdAt: new Date(row.created_at),
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
  });

  const transformActivity = (row: any): Activity => ({
    id: row.id,
    action: row.action,
    type: row.type,
    resourceId: row.resource_id,
    resourceName: row.resource_name,
    parentName: row.parent_name,
    timestamp: new Date(row.created_at),
  });

  // Load data from Supabase or localStorage
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    if (isUsingSupabase && supabase && user) {
      // Load from Supabase
      try {
        const [roomsRes, boxesRes, itemsRes, sharesRes, activitiesRes] = await Promise.all([
          supabase.from('rooms').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
          supabase.from('boxes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
          supabase.from('items').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
          supabase.from('shares').select('*').eq('user_id', user.id),
          supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        ]);

        setData({
          rooms: (roomsRes.data || []).map(transformRoom),
          boxes: (boxesRes.data || []).map(transformBox),
          items: (itemsRes.data || []).map(transformItem),
          shares: (sharesRes.data || []).map(transformShare),
          activities: (activitiesRes.data || []).map(transformActivity),
        });
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fall back to localStorage on error
        const inventory = storage.getInventory();
        setData(inventory);
      }
    } else {
      // Load from localStorage
      const inventory = storage.getInventory();
      setData(inventory);
    }
    
    setIsLoading(false);
  }, [user, supabase, isUsingSupabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Helper to log activity
  const logActivity = useCallback(async (
    action: Activity['action'],
    type: Activity['type'],
    resourceId: string,
    resourceName: string,
    parentName?: string
  ) => {
    if (isUsingSupabase && supabase && user) {
      try {
        await supabase.from('activities').insert({
          user_id: user.id,
          action,
          type,
          resource_id: resourceId,
          resource_name: resourceName,
          parent_name: parentName,
        } as any);
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    } else {
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
    }
  }, [user, supabase]);

  // Room operations
  const createRoom = useCallback(async (name: string, description?: string): Promise<Room> => {
    if (isUsingSupabase && supabase && user) {
      const { data: row, error } = await supabase
        .from('rooms')
        .insert({ user_id: user.id, name, description })
        .select()
        .single();
      
      if (error) throw error;
      const room = transformRoom(row);
      await logActivity('create', 'room', room.id, name);
      await refresh();
      return room;
    } else {
      const room: Room = {
        id: uuidv4(),
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.addRoom(room);
      await logActivity('create', 'room', room.id, name);
      await refresh();
      return room;
    }
  }, [user, supabase, refresh, logActivity]);

  const updateRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    const room = data.rooms.find(r => r.id === id);
    
    if (isUsingSupabase && supabase && user) {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: updates.name,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.updateRoom(id, updates);
    }
    
    if (room) await logActivity('update', 'room', id, updates.name || room.name);
    await refresh();
  }, [user, supabase, refresh, logActivity, data.rooms]);

  const deleteRoom = useCallback(async (id: string) => {
    const room = data.rooms.find(r => r.id === id);
    
    if (isUsingSupabase && supabase && user) {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.deleteRoom(id);
    }
    
    if (room) await logActivity('delete', 'room', id, room.name);
    await refresh();
  }, [user, supabase, refresh, logActivity, data.rooms]);

  const getRoom = useCallback((id: string) => {
    return data.rooms.find(r => r.id === id);
  }, [data.rooms]);

  // Box operations
  const createBox = useCallback(async (roomId: string, name: string, description?: string, image?: string): Promise<Box> => {
    const room = data.rooms.find(r => r.id === roomId);
    
    if (isUsingSupabase && supabase && user) {
      const { data: row, error } = await supabase
        .from('boxes')
        .insert({ user_id: user.id, room_id: roomId, name, description, image })
        .select()
        .single();
      
      if (error) throw error;
      const box = transformBox(row);
      await logActivity('create', 'box', box.id, name, room?.name);
      await refresh();
      return box;
    } else {
      const box: Box = {
        id: uuidv4(),
        roomId,
        name,
        description,
        image,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.addBox(box);
      await logActivity('create', 'box', box.id, name, room?.name);
      await refresh();
      return box;
    }
  }, [user, supabase, refresh, logActivity, data.rooms]);

  const updateBox = useCallback(async (id: string, updates: Partial<Box>) => {
    const box = data.boxes.find(b => b.id === id);
    const room = box ? data.rooms.find(r => r.id === box.roomId) : null;
    
    if (isUsingSupabase && supabase && user) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.roomId !== undefined) updateData.room_id = updates.roomId;
      if (updates.image !== undefined) updateData.image = updates.image;
      
      const { error } = await supabase
        .from('boxes')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.updateBox(id, updates);
    }
    
    if (box) await logActivity('update', 'box', id, updates.name || box.name, room?.name);
    await refresh();
  }, [user, supabase, refresh, logActivity, data.boxes, data.rooms]);

  const deleteBox = useCallback(async (id: string) => {
    const box = data.boxes.find(b => b.id === id);
    const room = box ? data.rooms.find(r => r.id === box.roomId) : null;
    
    if (isUsingSupabase && supabase && user) {
      const { error } = await supabase
        .from('boxes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.deleteBox(id);
    }
    
    if (box) await logActivity('delete', 'box', id, box.name, room?.name);
    await refresh();
  }, [user, supabase, refresh, logActivity, data.boxes, data.rooms]);

  const getBox = useCallback((id: string) => {
    return data.boxes.find(b => b.id === id);
  }, [data.boxes]);

  const getBoxesByRoom = useCallback((roomId: string) => {
    return data.boxes.filter(b => b.roomId === roomId);
  }, [data.boxes]);

  // Item operations
  const createItem = useCallback(async (boxId: string, itemData: Omit<Item, 'id' | 'boxId' | 'createdAt' | 'updatedAt'>): Promise<Item> => {
    const box = data.boxes.find(b => b.id === boxId);
    
    if (isUsingSupabase && supabase && user) {
      const { data: row, error } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          box_id: boxId,
          name: itemData.name,
          description: itemData.description,
          quantity: itemData.quantity,
          images: itemData.images,
          tags: itemData.tags,
          notes: itemData.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      const item = transformItem(row);
      await logActivity('create', 'item', item.id, itemData.name, box?.name);
      await refresh();
      return item;
    } else {
      const item: Item = {
        id: uuidv4(),
        boxId,
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.addItem(item);
      await logActivity('create', 'item', item.id, itemData.name, box?.name);
      await refresh();
      return item;
    }
  }, [user, supabase, refresh, logActivity, data.boxes]);

  const updateItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const item = data.items.find(i => i.id === id);
    const box = item ? data.boxes.find(b => b.id === item.boxId) : null;
    const isMove = updates.boxId && item && updates.boxId !== item.boxId;
    
    if (isUsingSupabase && supabase && user) {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.images !== undefined) updateData.images = updates.images;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.boxId !== undefined) updateData.box_id = updates.boxId;
      
      const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.updateItem(id, updates);
    }
    
    if (item) {
      if (isMove) {
        const newBox = data.boxes.find(b => b.id === updates.boxId);
        await logActivity('move', 'item', id, item.name, newBox?.name);
      } else {
        await logActivity('update', 'item', id, updates.name || item.name, box?.name);
      }
    }
    await refresh();
  }, [user, supabase, refresh, logActivity, data.items, data.boxes]);

  const deleteItem = useCallback(async (id: string) => {
    const item = data.items.find(i => i.id === id);
    const box = item ? data.boxes.find(b => b.id === item.boxId) : null;
    
    if (isUsingSupabase && supabase && user) {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.deleteItem(id);
    }
    
    if (item) await logActivity('delete', 'item', id, item.name, box?.name);
    await refresh();
  }, [user, supabase, refresh, logActivity, data.items, data.boxes]);

  const getItem = useCallback((id: string) => {
    return data.items.find(i => i.id === id);
  }, [data.items]);

  const getItemsByBox = useCallback((boxId: string) => {
    return data.items.filter(i => i.boxId === boxId);
  }, [data.items]);

  // Share operations
  const createShare = useCallback(async (type: 'room' | 'box' | 'item', resourceId: string, isPublic = true): Promise<Share> => {
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    if (isUsingSupabase && supabase && user) {
      const { data: row, error } = await supabase
        .from('shares')
        .insert({
          id: shareId,
          user_id: user.id,
          type,
          resource_id: resourceId,
          is_public: isPublic,
        })
        .select()
        .single();
      
      if (error) throw error;
      await refresh();
      return transformShare(row);
    } else {
      const share: Share = {
        id: shareId,
        type,
        resourceId,
        isPublic,
        createdAt: new Date(),
      };
      storage.addShare(share);
      await refresh();
      return share;
    }
  }, [user, supabase, refresh]);

  const getShare = useCallback((shareId: string) => {
    // For shares, we might need to fetch from Supabase without auth (public shares)
    return data.shares.find(s => s.id === shareId) || storage.getShare(shareId);
  }, [data.shares]);

  const deleteShare = useCallback(async (shareId: string) => {
    if (isUsingSupabase && supabase && user) {
      const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', shareId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } else {
      storage.deleteShare(shareId);
    }
    await refresh();
  }, [user, supabase, refresh]);

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
    isUsingSupabase,
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
