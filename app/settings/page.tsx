'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Bell, Trash2, ShieldAlert } from 'lucide-react';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

export default function SettingsPage() {
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        reminderFrequency,
        setReminderFrequency
    } = useSettings();

    const handleClearData = () => {
        if (confirm('Are you sure? This will delete ALL your local data. This action cannot be undone.')) {
            storage.clearAll();
            toast.success('All data cleared successfully');
            // Force reload to reset state
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Settings</h1>

            <div className="space-y-6">
                {/* Notifications Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-indigo-500" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Manage how and when you want to be reminded.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Nudges</Label>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Receive helpful reminders to keep your inventory organized.
                                </p>
                            </div>
                            <Switch
                                checked={notificationsEnabled}
                                onCheckedChange={setNotificationsEnabled}
                            />
                        </div>

                        {notificationsEnabled && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Label className="text-base mb-3 block">Reminder Frequency</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setReminderFrequency('daily')}
                                        className={reminderFrequency === 'daily' ? 'border-indigo-500 text-indigo-500' : ''}
                                    >
                                        Daily
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setReminderFrequency('weekly')}
                                        className={reminderFrequency === 'weekly' ? 'border-indigo-500 text-indigo-500' : ''}
                                    >
                                        Weekly
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Data Management Section */}
                <Card className="border-red-100 dark:border-red-900/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <ShieldAlert className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Manage your local data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base text-red-600 dark:text-red-400">Clear All Data</Label>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Permanently remove all rooms, boxes, and items from this device.
                                </p>
                            </div>
                            <Button
                                variant="danger"
                                onClick={handleClearData}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
