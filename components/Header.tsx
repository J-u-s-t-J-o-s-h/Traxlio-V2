'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GlobalSearch } from './GlobalSearch';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Home, Box, Settings, LogOut, LogIn, User, ChevronDown, Database } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { DataManager } from './DataManager';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isLandingPage || isAuthPage) {
    return null; // Landing page and auth pages have their own nav
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/rooms', label: 'Rooms', icon: Box },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/traxlio-icon.svg"
                alt="Traxlio"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Traxlio</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8 relative z-50">
              <GlobalSearch placeholder="Search boxes & items..." />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth & User Menu */}
              {!isLoading && (
                user ? (
                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                          >
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back,</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {user.email}
                              </p>
                            </div>

                            <Link
                              href="/settings"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              Notification Settings
                            </Link>

                            <button
                              onClick={() => {
                                setIsDataManagerOpen(true);
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <Database className="h-4 w-4" />
                              Data Management
                            </button>

                            <div className="my-2 border-t border-slate-100 dark:border-slate-700" />

                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="outline" size="sm">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )
              )}

              {/* Search Button - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchModalOpen(true)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 py-4"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                ))}

                {/* Auth - Mobile */}
                {!isLoading && (
                  user ? (
                    <>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

                      <div className="px-3 py-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Settings className="h-5 w-5" />
                        Notification Settings
                      </Link>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsDataManagerOpen(true);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Database className="h-5 w-5" />
                        Data Management
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/10"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-emerald-500 hover:bg-emerald-500/10"
                      >
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    </>
                  )
                )}
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Mobile Search Modal */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Search"
        size="lg"
      >
        <GlobalSearch
          autoFocus
          placeholder="Search boxes & items..."
          onResultClick={() => setIsSearchModalOpen(false)}
        />
      </Modal>

      {/* Data Manager Modal */}
      <DataManager
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </>
  );
};
