'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    reminderFrequency: 'daily' | 'weekly';
    setReminderFrequency: (frequency: 'daily' | 'weekly') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly'>('daily');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load settings from localStorage
        const savedNotifications = localStorage.getItem('settings_notifications');
        const savedFrequency = localStorage.getItem('settings_frequency');

        if (savedNotifications !== null) {
            setNotificationsEnabled(savedNotifications === 'true');
        }
        if (savedFrequency) {
            setReminderFrequency(savedFrequency as 'daily' | 'weekly');
        }
    }, []);

    const updateNotifications = (enabled: boolean) => {
        setNotificationsEnabled(enabled);
        localStorage.setItem('settings_notifications', String(enabled));
    };

    const updateFrequency = (frequency: 'daily' | 'weekly') => {
        setReminderFrequency(frequency);
        localStorage.setItem('settings_frequency', frequency);
    };

    return (
        <SettingsContext.Provider
            value={{
                notificationsEnabled,
                setNotificationsEnabled: updateNotifications,
                reminderFrequency,
                setReminderFrequency: updateFrequency,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
