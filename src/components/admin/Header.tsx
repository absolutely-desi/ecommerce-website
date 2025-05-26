// src/components/admin/Header.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Menu, Settings, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Clear admin token
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  return (
    <header className={`sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`h-9 w-9 text-muted-foreground hover:text-foreground ${isSidebarOpen ? 'active' : ''}`}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <Link 
            href="/obm-admin/dashboard" 
            className="flex items-center gap-2 font-serif text-lg font-bold text-tan hover:text-tan/80 transition-colors"
          >
            <span>ABSOLUTELY DESI</span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" 
                size="icon"
                className="h-9 w-9 rounded-full border border-border hover:bg-accent hover:text-accent-foreground"
              >
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-serif text-tan">
                Admin Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/obm-admin/profile" className="flex w-full cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/obm-admin/settings" className="flex w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
