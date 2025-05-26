// src/components/admin/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  User, 
  Settings,
  ChevronDown,
  ChevronRight,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Remove this import as we'll use regular div with overflow

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavItem[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/obm-admin/dashboard',
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: 'Product Management',
    href: '/obm-admin/product-management',
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: 'Order Management',
    href: '/obm-admin/manage-orders',
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    title: 'Payments & Transactions',
    href: '/obm-admin/payments',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: 'User Management',
    href: '/obm-admin/users',
    icon: <Users className="h-4 w-4" />,
    submenu: [
      {
        title: 'All Users',
        href: '/obm-admin/users/all',
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Affiliates',
        href: '/obm-admin/users/affiliates',
        icon: <User className="h-4 w-4" />,
      },
    ]
  },
  {
    title: 'Analytics',
    href: '/obm-admin/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    title: 'Settings',
    href: '/obm-admin/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Automatically expand the active submenu
  useEffect(() => {
    const checkPathAndOpenMenu = () => {
      navItems.forEach(item => {
        if (item.submenu && pathname.startsWith(item.href)) {
          setOpenMenus(prev => ({ ...prev, [item.title]: true }));
        }
      });
    };
    
    checkPathAndOpenMenu();
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Sidebar Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tan/20">
            <User className="h-5 w-5 text-tan" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif font-medium text-foreground">Admin Portal</h3>
            <p className="text-xs text-muted-foreground">admin@absolutelydesi.com</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isOpen = openMenus[item.title];
            
            return (
              <div key={item.href} className="space-y-1">
                {hasSubmenu ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => toggleSubmenu(item.title)}
                      className={cn(
                        "w-full justify-start h-9 px-3",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon}
                      <span className="ml-3 flex-1 text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {isOpen && (
                      <div className="ml-6 space-y-1">
                        {item.submenu?.map((subItem) => {
                          const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                          
                          return (
                            <Button
                              key={subItem.href}
                              variant="ghost"
                              asChild
                              className={cn(
                                "w-full justify-start h-8 px-3 text-sm",
                                isSubActive && "bg-accent text-accent-foreground"
                              )}
                            >
                              <Link href={subItem.href} onClick={handleLinkClick}>
                                {subItem.icon}
                                <span className="ml-3">{subItem.title}</span>
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full justify-start h-9 px-3",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Link href={item.href} onClick={handleLinkClick}>
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <p>© 2024 Absolutely Desi</p>
          <p>Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}