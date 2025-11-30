'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Box, Package, Home, ArrowRight, Sparkles, Shield, Zap, Share2, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { storage } from '@/lib/storage';

export default function LandingPage() {
  const router = useRouter();
  const { rooms, boxes, items, createRoom, createBox, createItem } = useInventory();
  const { user, isConfigured } = useAuth();
  const [demoLoaded, setDemoLoaded] = useState(false);

  const hasData = rooms.length > 0;
  const isLoggedIn = user !== null;

  const loadDemoData = async () => {
    setDemoLoaded(true);
    // Set demo cookie to bypass auth middleware (session cookie, no max-age)
    document.cookie = "demo_mode=true; path=/";

    // Clear any existing session storage
    storage.clearAll();

    // Create demo rooms
    const livingRoom = await createRoom('Living Room', 'Main living area with entertainment setup');
    const garage = await createRoom('Garage', 'Storage and tools');
    const bedroom = await createRoom('Master Bedroom', 'Clothes and personal items');

    // Create demo boxes
    const electronicsBox = await createBox(livingRoom.id, 'Electronics Box', 'Gaming consoles and accessories');
    const toolsBox = await createBox(garage.id, 'Tool Box', 'Hand tools and power tools');
    const winterBox = await createBox(bedroom.id, 'Winter Clothes', 'Seasonal clothing storage');
    const booksBox = await createBox(livingRoom.id, 'Books & Media', 'Books, DVDs, and magazines');

    // Create demo items
    await createItem(electronicsBox.id, {
      name: 'PlayStation 5',
      description: 'Gaming console with 2 controllers',
      quantity: 1,
      images: [],
      tags: ['gaming', 'electronics', 'entertainment'],
      notes: 'Purchased Dec 2023',
    });

    await createItem(electronicsBox.id, {
      name: 'Nintendo Switch',
      description: 'Portable gaming console',
      quantity: 1,
      images: [],
      tags: ['gaming', 'portable'],
      notes: 'OLED model',
    });

    await createItem(toolsBox.id, {
      name: 'Cordless Drill',
      description: 'DeWalt 20V MAX',
      quantity: 1,
      images: [],
      tags: ['power tools', 'dewalt'],
      notes: 'Includes 2 batteries',
    });

    await createItem(toolsBox.id, {
      name: 'Screwdriver Set',
      description: 'Phillips and flathead assortment',
      quantity: 24,
      images: [],
      tags: ['hand tools'],
    });

    await createItem(winterBox.id, {
      name: 'Winter Jacket',
      description: 'North Face parka',
      quantity: 1,
      images: [],
      tags: ['clothing', 'winter', 'outerwear'],
      notes: 'Size Large',
    });

    await createItem(winterBox.id, {
      name: 'Wool Sweaters',
      description: 'Assorted colors',
      quantity: 5,
      images: [],
      tags: ['clothing', 'winter'],
    });

    await createItem(booksBox.id, {
      name: 'Programming Books',
      description: 'JavaScript, React, and TypeScript guides',
      quantity: 12,
      images: [],
      tags: ['books', 'tech', 'learning'],
    });

    router.push('/dashboard');
  };

  const features = [
    {
      icon: Home,
      title: 'Organize by Location',
      description: 'Create rooms and locations to categorize where your items are stored.',
    },
    {
      icon: Box,
      title: 'Box Management',
      description: 'Group items into boxes for easy tracking and retrieval.',
    },
    {
      icon: Package,
      title: 'Detailed Items',
      description: 'Add photos, tags, quantities, and notes to every item.',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Generate shareable links to show others what you have stored.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Image
              src="/traxlio-icon.svg"
              alt="Traxlio"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold tracking-tight">Traxlio</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {isLoggedIn ? (
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Track Everything You Own
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Never Lose Track
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Of Your Belongings
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Traxlio helps you organize and track your inventory across rooms, boxes, and storage locations.
            Know exactly what you have and where it is.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={loadDemoData}
              size="lg"
              isLoading={demoLoaded}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8"
            >
              {demoLoaded ? 'Loading...' : 'Try Demo'}
              {!demoLoaded && <Sparkles className="ml-2 h-5 w-5" />}
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
            </div>
            <p className="text-slate-400 mb-6">
              {isLoggedIn ? (
                <>Your data is securely stored with Supabase and synced across devices.</>
              ) : isConfigured ? (
                <>Sign up for a free account to save your inventory to the cloud and access it from any device.</>
              ) : (
                <>Try the demo to explore the app! Data is stored locally in your browser.</>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Fast & Responsive</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>Row Level Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Share2 className="h-4 w-4 text-cyan-500" />
                <span>Easy Sharing</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>Built with Next.js, Tailwind CSS, Framer Motion & Supabase</p>
        </div>
      </footer>
    </div>
  );
}
