import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

export function MobileActionButton({
    icon: Icon,
    label,
    onClick,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    className,
}: MobileActionButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

    const variantStyles = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        warning: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm min-h-[40px]',
        md: 'px-5 py-3 text-base min-h-[48px]',
        lg: 'px-6 py-4 text-lg min-h-[56px]',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
        >
            {loading ? (
                <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-5 h-5" />
            ) : (
                <Icon className={iconSizes[size]} />
            )}
            <span>{label}</span>
        </button>
    );
}

interface MobileIconButtonProps {
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'ghost' | 'primary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    label?: string; // For accessibility
    disabled?: boolean;
    className?: string;
}

export function MobileIconButton({
    icon: Icon,
    onClick,
    variant = 'ghost',
    size = 'md',
    label,
    disabled = false,
    className,
}: MobileIconButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        ghost: 'hover:bg-secondary/80 active:bg-secondary text-foreground',
        primary: 'bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary',
        danger: 'bg-destructive/10 hover:bg-destructive/20 active:bg-destructive/30 text-destructive',
    };

    const sizeStyles = {
        sm: 'p-2 min-w-[40px] min-h-[40px]',
        md: 'p-2.5 min-w-[44px] min-h-[44px]',
        lg: 'p-3 min-w-[48px] min-h-[48px]',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            <Icon className={iconSizes[size]} />
        </button>
    );
}

interface MobileButtonGroupProps {
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}

export function MobileButtonGroup({
    children,
    orientation = 'horizontal',
    className,
}: MobileButtonGroupProps) {
    return (
        <div
            className={cn(
                'flex gap-2',
                orientation === 'horizontal' ? 'flex-row' : 'flex-col',
                className
            )}
        >
            {children}
        </div>
    );
}
