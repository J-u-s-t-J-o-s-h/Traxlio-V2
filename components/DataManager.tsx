'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, FileJson, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useInventory } from '@/context/InventoryContext';
import { useToast } from '@/components/ui/Toast';
import { storage } from '@/lib/storage';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose }) => {
  const { rooms, boxes, items, refresh } = useInventory();
  const { success, error, warning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    rooms: number;
    boxes: number;
    items: number;
  } | null>(null);
  const [pendingImportData, setPendingImportData] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    try {
      const data = storage.getInventory();
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
          rooms: data.rooms,
          boxes: data.boxes,
          items: data.items,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `traxlio-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      success('Data exported successfully!');
    } catch (err) {
      error('Failed to export data');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Validate structure
        if (!parsed.data || !Array.isArray(parsed.data.rooms) || !Array.isArray(parsed.data.boxes) || !Array.isArray(parsed.data.items)) {
          error('Invalid file format. Please select a valid Traxlio backup file.');
          return;
        }

        setImportPreview({
          rooms: parsed.data.rooms.length,
          boxes: parsed.data.boxes.length,
          items: parsed.data.items.length,
        });
        setPendingImportData(content);
      } catch (err) {
        error('Failed to read file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = (merge: boolean) => {
    if (!pendingImportData) return;

    try {
      const parsed = JSON.parse(pendingImportData);

      if (merge) {
        // Merge with existing data
        const existingData = storage.getInventory();
        const existingRoomIds = new Set(existingData.rooms.map(r => r.id));
        const existingBoxIds = new Set(existingData.boxes.map(b => b.id));
        const existingItemIds = new Set(existingData.items.map(i => i.id));

        let newRooms = 0, newBoxes = 0, newItems = 0;

        parsed.data.rooms.forEach((room: any) => {
          if (!existingRoomIds.has(room.id)) {
            storage.addRoom(room);
            newRooms++;
          }
        });

        parsed.data.boxes.forEach((box: any) => {
          if (!existingBoxIds.has(box.id)) {
            storage.addBox(box);
            newBoxes++;
          }
        });

        parsed.data.items.forEach((item: any) => {
          if (!existingItemIds.has(item.id)) {
            storage.addItem(item);
            newItems++;
          }
        });

        success(`Merged: ${newRooms} rooms, ${newBoxes} boxes, ${newItems} items added`);
      } else {
        // Replace all data
        storage.clearAll();
        parsed.data.rooms.forEach((room: any) => storage.addRoom(room));
        parsed.data.boxes.forEach((box: any) => storage.addBox(box));
        parsed.data.items.forEach((item: any) => storage.addItem(item));

        success(`Imported: ${parsed.data.rooms.length} rooms, ${parsed.data.boxes.length} boxes, ${parsed.data.items.length} items`);
      }

      refresh();
      setImportPreview(null);
      setPendingImportData(null);
    } catch (err) {
      error('Failed to import data');
    }
  };

  const handleClearAll = () => {
    storage.clearAll();
    refresh();
    success('All data cleared');
    setShowClearConfirm(false);
  };

  const cancelImport = () => {
    setImportPreview(null);
    setPendingImportData(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Data Management" size="lg">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{rooms.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Rooms</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{boxes.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Boxes</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Items</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-500" />
            Export Data
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Download your inventory data as a JSON file for backup or transfer.
          </p>
          <Button onClick={handleExport}>
            <FileJson className="h-4 w-4 mr-2" />
            Export to JSON
          </Button>
        </div>

        {/* Import Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Import Data
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Import inventory data from a previously exported JSON file.
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {importPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">File ready to import</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {importPreview.rooms} rooms, {importPreview.boxes} boxes, {importPreview.items} items
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleImport(true)} variant="secondary" size="sm">
                    Merge with existing
                  </Button>
                  <Button onClick={() => handleImport(false)} variant="primary" size="sm">
                    Replace all data
                  </Button>
                  <Button onClick={cancelImport} variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                  <Upload className="h-4 w-4 mr-2" />
                  Select JSON File
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Permanently delete all your inventory data. This action cannot be undone.
          </p>
          
          <AnimatePresence mode="wait">
            {showClearConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Are you sure? This will delete {rooms.length} rooms, {boxes.length} boxes, and {items.length} items.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleClearAll} variant="danger" size="sm">
                    Yes, delete everything
                  </Button>
                  <Button onClick={() => setShowClearConfirm(false)} variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Button onClick={() => setShowClearConfirm(true)} variant="danger">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

