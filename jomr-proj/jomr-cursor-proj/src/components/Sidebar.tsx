'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activePath?: string;
  exactMatch?: boolean;
  external?: boolean;
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: HomeIcon },
  { href: '/chat', label: 'AI Chat', icon: ChatIcon, activePath: '/chat' },
  { href: '/dashboards', label: 'API Keys', icon: KeyIcon, activePath: '/dashboards', exactMatch: true },
  { href: '/dashboards/playground', label: 'API Playground', icon: CodeIcon, activePath: '/dashboards/playground' },
  { href: '#', label: 'Documentation', icon: DocIcon, external: true },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out ${
        isOpen ? 'w-56' : 'w-0'
      }`}
    >
      <aside className="flex h-full w-56 flex-col border-r border-[#333] bg-[#0a0a0a]">
      {/* Branding + Toggle */}
      <div className="flex items-center justify-between border-b border-[#333] px-4 py-5">
        <Link href="/" className="text-xl font-bold text-white">
          JOMR
        </Link>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-2 text-[#888] transition-colors hover:bg-[#222] hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-4 py-4">
        {navItems.map((item) => {
          const isActive = item.activePath
            ? item.exactMatch
              ? pathname === item.activePath
              : pathname.startsWith(item.activePath)
            : pathname === item.href;
          const Icon = item.icon;

          const linkContent = (
            <>
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#888]'}`}
              />
              <span className={isActive ? 'font-medium text-white' : 'text-[#888]'}>
                {item.label}
              </span>
              {item.external && (
                <ExternalIcon className="ml-auto h-4 w-4 flex-shrink-0 text-[#888]" />
              )}
            </>
          );

          const linkClassName = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive
              ? 'bg-[#1a1a1a] text-white'
              : 'text-[#888] hover:bg-[#222] hover:text-white'
          }`;

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {linkContent}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={linkClassName}>
              {linkContent}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-[#333] px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#333] text-sm font-medium text-[#888]">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">User</p>
          </div>
          <button
            type="button"
            className="rounded p-1.5 text-[#888] transition-colors hover:bg-[#222] hover:text-white"
            aria-label="Settings"
          >
            <GearIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
    </div>
  );
}

export function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-lg border border-[#333] bg-[#1a1a1a] p-2 text-[#888] transition-colors hover:bg-[#222] hover:text-white"
      aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}
