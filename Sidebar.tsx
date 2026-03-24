'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard', section: 'Principal' },
  { label: 'Avis', icon: '⭐', href: '/dashboard/reviews', section: 'Principal', badge: true },
  { label: 'Campagnes SMS', icon: '📱', href: '/dashboard/sms', section: 'Principal' },
  { label: 'Clients', icon: '👥', href: '/dashboard/customers', section: 'Principal' },
  { label: 'Analytics', icon: '📈', href: '/dashboard/analytics', section: 'Outils' },
  { label: 'Intégrations', icon: '🔗', href: '/dashboard/integrations', section: 'Outils' },
  { label: 'Paramètres', icon: '⚙️', href: '/dashboard/settings', section: 'Outils' },
  { label: 'Aide & FAQ', icon: '💬', href: '/dashboard/help', section: 'Support' },
];

interface SidebarProps {
  business: { name: string; plan: string; city: string };
}

export default function Sidebar({ business }: SidebarProps) {
  const pathname = usePathname();

  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const initials = business.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-[260px] h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-600 rounded-[10px] flex items-center justify-center text-white font-extrabold text-base">
          A
        </div>
        <span className="font-extrabold text-xl text-blue-600 tracking-tight">Avizio</span>
        <span className="ml-auto px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-bold">
          Bêta
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-5">
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[1.5px] text-gray-400">
              {section}
            </div>
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium mb-0.5 transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span className="w-5 text-center text-base">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-3.5 border-t border-gray-100 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-gray-800 truncate max-w-[150px]">{business.name}</div>
          <div className="text-[11px] text-gray-400">
            Plan {business.plan} · {business.city}
          </div>
        </div>
      </div>
    </aside>
  );
}
