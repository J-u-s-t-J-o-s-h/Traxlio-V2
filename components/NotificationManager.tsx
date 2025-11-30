'use client';

import { useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useSettings } from '@/context/SettingsContext';
import { toast } from 'sonner';
import { Box } from 'lucide-react';

export function NotificationManager() {
    const { boxes, isLoading } = useInventory();
    const { notificationsEnabled } = useSettings();

    useEffect(() => {
        if (!notificationsEnabled || isLoading) return;

        const checkNudges = () => {
            // Check if user has no boxes (Nudge to create first box)
            if (boxes.length === 0) {
                const lastNudge = localStorage.getItem('last_nudge_create_box');
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                // Nudge if never nudged or 24 hours passed
                if (!lastNudge || now - parseInt(lastNudge) > oneDay) {
                    toast('Ready to organize?', {
                        description: 'Create your first box to start tracking your items!',
                        icon: <Box className="h-4 w-4 text-emerald-500" />,
                        duration: 8000,
                        action: {
                            label: 'Create Box',
                            onClick: () => window.location.href = '/boxes/new',
                        },
                    });
                    localStorage.setItem('last_nudge_create_box', String(now));
                }
            }
        };

        // Check immediately on mount/update
        checkNudges();

        // Optional: Set up an interval if we want to check periodically while app is open
        // const interval = setInterval(checkNudges, 60000);
        // return () => clearInterval(interval);

    }, [boxes.length, isLoading, notificationsEnabled]);

    return null; // This component doesn't render anything visible
}
