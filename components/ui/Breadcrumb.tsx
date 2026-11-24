import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component.
 * Renders accessible breadcrumbs AND injects BreadcrumbList JSON-LD.
 * The last item is the current page (no link, aria-current="page").
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const all = [{ label: 'Home', href: '/' }, ...items];

  // BreadcrumbList JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `https://orion.trade${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Visual breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs font-mono ${className}`}
      >
        <ol className="flex items-center gap-1.5 flex-wrap" role="list">
          {all.map((item, idx) => {
            const isLast = idx === all.length - 1;
            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx === 0 && (
                  <Home
                    className="w-3 h-3 shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className="font-semibold"
                    style={{ color: '#10b981' }}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href!}
                    className="transition-colors hover:text-white"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight
                    className="w-3 h-3 shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
