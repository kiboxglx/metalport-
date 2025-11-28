import React from 'react';

/**
 * PageHeader Component
 * 
 * Standardized header for all main pages in the Metalport system.
 * Displays page title, optional subtitle, and an optional action button.
 * 
 * Usage example:
 * <PageHeader 
 *   title="Tendas" 
 *   subtitle="Lista de tendas cadastradas para aluguel"
 *   actionLabel="+ Nova tenda"
 *   onActionClick={() => console.log('Create tent')}
 * />
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
      {/* Left side: Title and subtitle */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>

      {/* Right side: Optional action button */}
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
