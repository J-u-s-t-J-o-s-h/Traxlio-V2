'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, QrCode, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useToast } from './ui/Toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  boxId: string;
  boxName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  boxId,
  boxName,
}) => {
  const { success } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Generate the URL for this box
  const boxUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/boxes/${boxId}`
    : `/boxes/${boxId}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      
      // White background
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `qr-${boxName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      success('QR code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(boxUrl);
      setCopied(true);
      success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = boxUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" size="sm">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-emerald-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">{boxName}</h3>
        </div>

        <motion.div
          ref={qrRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-4 rounded-xl shadow-lg mb-6"
        >
          <QRCodeSVG
            value={boxUrl}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />
        </motion.div>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 px-4">
          Scan this QR code to quickly access this box from any device
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
          <Button onClick={handleCopyUrl} variant="secondary" className="flex-1">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            {boxUrl}
          </p>
        </div>
      </div>
    </Modal>
  );
};

