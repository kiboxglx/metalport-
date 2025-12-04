import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MobileCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function MobileCard({
    children,
    className,
    onClick,
    variant = 'default',
    padding = 'md',
}: MobileCardProps) {
    const baseStyles = 'rounded-2xl transition-all duration-200 active:scale-[0.98]';

    const variantStyles = {
        default: 'bg-card border border-border',
        elevated: 'bg-card shadow-lg shadow-black/5',
        outlined: 'bg-transparent border-2 border-border',
    };

    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4 md:p-6',
        lg: 'p-6 md:p-8',
    };

    const interactiveStyles = onClick
        ? 'cursor-pointer hover:shadow-md active:shadow-sm'
        : '';

    return (
        <div
            onClick={onClick}
            className={cn(
                baseStyles,
                variantStyles[variant],
                paddingStyles[padding],
                interactiveStyles,
                className
            )}
        >
            {children}
        </div>
    );
}

interface MobileCardHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export function MobileCardHeader({
    title,
    subtitle,
    icon: Icon,
    action,
    className,
}: MobileCardHeaderProps) {
    return (
        <div className={cn('flex items-start justify-between mb-3', className)}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
                {Icon && (
                    <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="flex-shrink-0 ml-2">{action}</div>}
        </div>
    );
}

interface MobileCardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function MobileCardContent({
    children,
    className,
}: MobileCardContentProps) {
    return (
        <div className={cn('space-y-3', className)}>
            {children}
        </div>
    );
}

interface MobileCardFooterProps {
    children: React.ReactNode;
    className?: string;
    divided?: boolean;
}

export function MobileCardFooter({
    children,
    className,
    divided = true,
}: MobileCardFooterProps) {
    return (
        <div
            className={cn(
                'mt-4 pt-4',
                divided && 'border-t border-border',
                className
            )}
        >
            {children}
        </div>
    );
}

interface MobileCardActionsProps {
    children: React.ReactNode;
    className?: string;
    layout?: 'horizontal' | 'vertical';
}

export function MobileCardActions({
    children,
    className,
    layout = 'horizontal',
}: MobileCardActionsProps) {
    return (
        <div
            className={cn(
                'flex gap-2',
                layout === 'horizontal' ? 'flex-row' : 'flex-col',
                className
            )}
        >
            {children}
        </div>
    );
}
