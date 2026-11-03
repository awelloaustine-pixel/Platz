import type { HTMLAttributes, ReactNode } from 'react';

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'li' | 'article' | 'blockquote';
  children: ReactNode;
};

export function GlassCard({ as: Tag = 'div', className = '', children, ...rest }: GlassCardProps) {
  return (
    <Tag className={`glass glass-card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
