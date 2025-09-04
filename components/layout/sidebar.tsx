'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  BarChart3, 
  Users, 
  LogOut
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard (Admin)',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'User View',
    href: '/user',
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image
            src="/Praxio Logo clean-12 (logo only).png"
            alt="Praxio AI Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Praxio AI</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign out
        </Button>
      </div>
    </div>
  );
}