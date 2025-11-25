'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
  type: 'room' | 'box' | 'item';
  resourceName: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  shareId,
  type,
  resourceName,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share/${shareId}`
    : '';

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Share <strong className="text-white">{resourceName}</strong> with others using this link:
        </p>
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="flex-1"
          />
          <Button
            onClick={handleCopy}
            variant={copied ? 'secondary' : 'primary'}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Anyone with this link can view this {type}.
        </p>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
