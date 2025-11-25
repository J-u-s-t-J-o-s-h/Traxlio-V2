'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', className)}
    >
      {/* Home link */}
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        
        return (
          <React.Fragment key={item.label}>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            
            {isLast ? (
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                {Icon && <Icon className="h-4 w-4 text-emerald-500" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href || '#'}
                className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

