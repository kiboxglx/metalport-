import React from 'react';

/**
 * Card Component
 * 
 * Simple wrapper component for consistent card styling across the app.
 * Used for sections, lists, forms, and content blocks.
 * 
 * Usage example:
 * <Card>
 *   <p>Your content here</p>
 * </Card>
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-xl shadow-sm border border-border p-4 ${className}`}>
      {children}
    </div>
  );
};
