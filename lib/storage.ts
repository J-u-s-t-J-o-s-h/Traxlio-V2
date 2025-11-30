import { InventoryData, Room, Box, Item, Share, Activity } from './types';
import { STORAGE_KEYS } from './constants';

// Helper to serialize dates
function serialize(data: any): any {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }));
}

// Helper to deserialize dates
function deserialize(data: any): any {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
}

export const storage = {
  // Helper to get the correct storage backend
  getStorage(): Storage {
    if (typeof window === 'undefined') return {} as Storage; // Fallback for SSR

    // Check if we are in demo mode
    const isDemoMode = document.cookie.includes('demo_mode=true');
    return isDemoMode ? sessionStorage : localStorage;
  },

  // Inventory data
  getInventory(): InventoryData {
    if (typeof window === 'undefined') {
      return { rooms: [], boxes: [], items: [], shares: [], activities: [] };
    }

    const store = this.getStorage();
    const data = store.getItem(STORAGE_KEYS.INVENTORY);
    if (!data) {
      return { rooms: [], boxes: [], items: [], shares: [], activities: [] };
    }

    try {
      const parsed = JSON.parse(data);
      return {
        rooms: parsed.rooms?.map((r: any) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })) || [],
        boxes: parsed.boxes?.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt), updatedAt: new Date(b.updatedAt) })) || [],
        items: parsed.items?.map((i: any) => ({ ...i, createdAt: new Date(i.createdAt), updatedAt: new Date(i.updatedAt) })) || [],
        shares: parsed.shares?.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt), expiresAt: s.expiresAt ? new Date(s.expiresAt) : undefined })) || [],
        activities: parsed.activities?.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })) || [],
      };
    } catch {
      return { rooms: [], boxes: [], items: [], shares: [], activities: [] };
    }
  },

  saveInventory(data: InventoryData): void {
    if (typeof window === 'undefined') return;
    const store = this.getStorage();
    store.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(serialize(data)));
  },

  // Individual operations
  addRoom(room: Room): void {
    const data = this.getInventory();
    data.rooms.push(room);
    this.saveInventory(data);
  },

  updateRoom(id: string, updates: Partial<Room>): void {
    const data = this.getInventory();
    const index = data.rooms.findIndex(r => r.id === id);
    if (index !== -1) {
      data.rooms[index] = { ...data.rooms[index], ...updates, updatedAt: new Date() };
      this.saveInventory(data);
    }
  },

  deleteRoom(id: string): void {
    const data = this.getInventory();
    data.rooms = data.rooms.filter(r => r.id !== id);
    // Also delete boxes and items in this room
    const boxIds = data.boxes.filter(b => b.roomId === id).map(b => b.id);
    data.boxes = data.boxes.filter(b => b.roomId !== id);
    data.items = data.items.filter(i => !boxIds.includes(i.boxId));
    this.saveInventory(data);
  },

  addBox(box: Box): void {
    const data = this.getInventory();
    data.boxes.push(box);
    this.saveInventory(data);
  },

  updateBox(id: string, updates: Partial<Box>): void {
    const data = this.getInventory();
    const index = data.boxes.findIndex(b => b.id === id);
    if (index !== -1) {
      data.boxes[index] = { ...data.boxes[index], ...updates, updatedAt: new Date() };
      this.saveInventory(data);
    }
  },

  deleteBox(id: string): void {
    const data = this.getInventory();
    data.boxes = data.boxes.filter(b => b.id !== id);
    // Also delete items in this box
    data.items = data.items.filter(i => i.boxId !== id);
    this.saveInventory(data);
  },

  addItem(item: Item): void {
    const data = this.getInventory();
    data.items.push(item);
    this.saveInventory(data);
  },

  updateItem(id: string, updates: Partial<Item>): void {
    const data = this.getInventory();
    const index = data.items.findIndex(i => i.id === id);
    if (index !== -1) {
      data.items[index] = { ...data.items[index], ...updates, updatedAt: new Date() };
      this.saveInventory(data);
    }
  },

  deleteItem(id: string): void {
    const data = this.getInventory();
    data.items = data.items.filter(i => i.id !== id);
    this.saveInventory(data);
  },

  addShare(share: Share): void {
    const data = this.getInventory();
    data.shares.push(share);
    this.saveInventory(data);
  },

  getShare(shareId: string): Share | null {
    const data = this.getInventory();
    return data.shares.find(s => s.id === shareId) || null;
  },

  deleteShare(shareId: string): void {
    const data = this.getInventory();
    data.shares = data.shares.filter(s => s.id !== shareId);
    this.saveInventory(data);
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    const store = this.getStorage();
    // We only clear the inventory key, not everything in storage
    store.removeItem(STORAGE_KEYS.INVENTORY);
  },

  addActivity(activity: Activity): void {
    const data = this.getInventory();
    // Keep only the last 50 activities
    data.activities = [activity, ...data.activities].slice(0, 50);
    this.saveInventory(data);
  },

  getRecentActivities(limit: number = 10): Activity[] {
    const data = this.getInventory();
    return data.activities.slice(0, limit);
  },
};

