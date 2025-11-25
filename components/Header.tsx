'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { GlobalSearch } from './GlobalSearch';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { motion } from 'framer-motion';
import { Search, Menu, X, Home, Box, Settings, LogOut, LogIn, User } from 'lucide-react';
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
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDataManagerOpen(true)}
                className="hidden sm:flex"
                title="Data Management"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Auth Button - Desktop */}
              {!isLoading && (
                user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="hidden sm:flex items-center gap-2"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
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
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsDataManagerOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  Data Management
                </button>
                
                {/* Auth - Mobile */}
                {!isLoading && (
                  user ? (
                    <>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <div className="flex items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400">
                        <User className="h-5 w-5" />
                        <span className="text-sm truncate">{user.email}</span>
                      </div>
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
