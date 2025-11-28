import React from 'react';

/**
 * StatusBadge Component
 * 
 * Reusable badge for displaying status labels with consistent styling.
 * Separates visual presentation from business logic.
 * 
 * Instead of repeating <span className="..."> everywhere, each page defines
 * a status mapping object and passes the appropriate colorClass to this component.
 * 
 * Usage example:
 * const statusConfig = {
 *   DISPONIVEL: { label: 'Disponível', colorClass: 'bg-emerald-100 text-emerald-800' },
 *   EM_MANUTENCAO: { label: 'Em manutenção', colorClass: 'bg-yellow-100 text-yellow-800' }
 * };
 * 
 * <StatusBadge 
 *   label={statusConfig[tent.status].label} 
 *   colorClass={statusConfig[tent.status].colorClass} 
 * />
 */

interface StatusBadgeProps {
  label: string;
  colorClass: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, colorClass, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {label}
    </span>
  );
};
