import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { TutorialProvider } from '@/context/TutorialContext';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';

import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const isDemoMode = cookieStore.get('demo_mode')?.value === 'true' && !user;

    return (
        <TutorialProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <TutorialOverlay />
                {isDemoMode && (
                    <div className="bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white relative z-50">
                        <p>
                            You are in a temporary demo session. Data will not be saved.
                            <Link href="/signup" className="ml-2 underline hover:text-indigo-100 font-bold">
                                Sign up to save your data
                            </Link>
                        </p>
                    </div>
                )}
                {children}
            </div>
        </TutorialProvider>
    );
}
