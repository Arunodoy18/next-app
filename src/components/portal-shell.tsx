"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Logo from "@/components/logo/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  PanelLeftIcon,
  ChevronsUpDown,
  Settings,
  Sun,
  Moon,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

/**
 * Shared portal chrome matching the student dashboard: full-height
 * collapsible sidebar with the logo, floating avatar menu on desktop,
 * hide-on-scroll topbar + slide-in sidebar on mobile.
 */
export default function PortalShell({
  title,
  portalName,
  items,
  basePath,
  userLabel,
  userInitials,
  children,
}: {
  title: string;
  portalName: string;
  items: PortalNavItem[];
  basePath: string;
  userLabel: string;
  userInitials: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setTopBarVisible(y <= lastY || y < 50);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === basePath ? pathname === href : pathname.startsWith(href));

  const accountMenu = (
    <DropdownMenuContent align="end" className="w-56">
      <p className="px-1.5 py-1.5 text-sm font-medium text-foreground">{userLabel}</p>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-base py-2 [&_svg]:size-[18px]">
        <Settings size={18} />
        Account Settings
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-base py-2 [&_svg]:size-[18px]"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        Toggle Theme
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        className="text-base py-2 [&_svg]:size-[18px]"
        onClick={() => router.push("/login")}
      >
        <LogOut size={18} />
        Log Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile/tablet top bar */}
      <div
        className={`fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-4 bg-card border-b border-border transition-transform duration-200 lg:hidden ${
          topBarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted transition-colors ${
            sidebarOpen ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Menu size={20} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={sidebarOpen}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-left ${
              sidebarOpen ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#7e55f6] text-white text-sm font-medium leading-none">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <ChevronsUpDown size={16} className="text-muted-foreground shrink-0 self-center" />
          </DropdownMenuTrigger>
          {accountMenu}
        </DropdownMenu>
      </div>

      {/* Desktop sidebar expand toggle (when collapsed) */}
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="hidden lg:flex fixed top-9 -translate-y-1/2 left-4 z-50 items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
        >
          <PanelLeftIcon size={16} />
        </button>
      )}

      {/* Top-right account menu (desktop) */}
      <DropdownMenu>
        <DropdownMenuTrigger className="hidden lg:flex fixed top-4 right-4 z-50 items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-left">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#7e55f6] text-white text-sm font-medium leading-none">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <ChevronsUpDown size={16} className="text-muted-foreground shrink-0 self-center" />
        </DropdownMenuTrigger>
        {accountMenu}
      </DropdownMenu>

      <div className="flex flex-1">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky inset-y-0 lg:inset-y-auto lg:top-0 left-0 z-50 lg:h-screen max-w-[85vw] shrink-0 border-r border-border bg-background overflow-hidden transition-[width,padding,border] duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 ${
            sidebarCollapsed ? "lg:w-0 lg:border-0" : sidebarOpen ? "w-80 lg:w-72 xl:w-80" : "w-72 lg:w-72 xl:w-80"
          }`}
        >
          {/* Desktop sidebar collapse toggle */}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex absolute top-9 -translate-y-1/2 right-3 z-10 items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
            >
              <PanelLeftIcon size={16} />
            </button>
          )}
          <div className="w-80 lg:w-72 xl:w-80 h-full flex flex-col p-4 gap-6 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-[0.25rem] text-[1.4rem] font-normal whitespace-nowrap">
                <Logo
                  width="22"
                  height="42"
                  color="var(--foreground)"
                  className="shrink-0"
                  style={{ marginRight: "0.7rem" }}
                />
                <div>
                  <span className="text-foreground">Blackmont</span>{" "}
                  <span className="text-muted-foreground">{portalName}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center h-8 w-8 shrink-0 rounded-lg hover:bg-muted transition-colors lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              <p className="text-xs uppercase tracking-wide text-muted-foreground px-3 mb-1">{title}</p>
              {items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between gap-2 text-left px-3 py-2 rounded-lg text-sm ${
                      active
                        ? "bg-[#7e55f6] hover:bg-[#6742d4] text-white"
                        : "border border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium truncate">
                      <Icon size={16} className={`shrink-0 ${active ? "text-white" : "text-[#7e55f6]"}`} />
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-xs rounded-full px-1.5 py-px leading-4 shrink-0 font-medium ${
                          active ? "bg-white/20 text-white" : "bg-[#7e55f6] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
