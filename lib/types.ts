export interface Room {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Box {
  id: string;
  roomId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  boxId: string;
  name: string;
  description?: string;
  quantity: number;
  images: string[];
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Share {
  id: string;
  type: 'room' | 'box' | 'item';
  resourceId: string;
  isPublic: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export type ActivityAction = 'create' | 'update' | 'delete' | 'move';
export type ActivityType = 'room' | 'box' | 'item';

export interface Activity {
  id: string;
  action: ActivityAction;
  type: ActivityType;
  resourceId: string;
  resourceName: string;
  parentName?: string;
  timestamp: Date;
}

export type InventoryData = {
  rooms: Room[];
  boxes: Box[];
  items: Item[];
  shares: Share[];
  activities: Activity[];
};

