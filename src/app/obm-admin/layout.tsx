// src/app/obm-admin/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/admin/Header';
import Sidebar from '@/components/admin/Sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div
          className={cn(
            "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:top-0 lg:z-0 lg:h-full lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            !isSidebarOpen && !isMobile && "lg:-translate-x-full"
          )}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-200 ease-in-out",
          isSidebarOpen && !isMobile ? "lg:ml-0" : ""
        )}>
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}