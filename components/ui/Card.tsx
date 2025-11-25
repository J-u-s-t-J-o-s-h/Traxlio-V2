import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'onClick'> {
  hover?: boolean;
  onClick?: () => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, onClick, children, ...props }, ref) => {
    const baseStyles = cn(
      'backdrop-blur-sm rounded-xl border shadow-lg p-6 transition-all duration-200',
      'bg-white/80 border-slate-200',
      'dark:bg-slate-800/50 dark:border-slate-700/50'
    );
    const hoverStyles = hover 
      ? 'hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800/70 dark:hover:border-slate-600 cursor-pointer' 
      : '';

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, hoverStyles, className)}
        whileHover={hover ? { y: -2, scale: 1.01 } : {}}
        whileTap={hover && onClick ? { scale: 0.99 } : {}}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-semibold text-slate-900 dark:text-white', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';
