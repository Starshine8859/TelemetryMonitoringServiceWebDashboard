import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CircleAlert,
  Computer,
  LineChart,
  SettingsIcon,
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Devices", href: "/devices", icon: Computer },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [openSecuritySub, setOpenSecuritySub] = useState(false);

  return (
    <Sidebar
      className={`border-r border-border ${
        collapsed ? "w-[70px]" : "w-64"
      } transition-all duration-300 ease-in-out`}
      collapsible="icon"
    >
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`
                    }
                    end={item.href === "/"}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* Security Item with Toggleable Submenu */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setOpenSecuritySub(!openSecuritySub)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 w-full"
              >
                <LineChart className="h-5 w-5" />
                {!collapsed && (
                  <span className="flex-1 text-left">Security</span>
                )}
                {!collapsed && (
                  <span className="text-xs">{openSecuritySub ? "▾" : "▸"}</span>
                )}
              </SidebarMenuButton>

              {!collapsed && openSecuritySub && (
                <div className="ml-8 mt-1 space-y-1">
                  <NavLink
                    to="/security/networkProtection"
                    className={({ isActive }) =>
                      `block px-2 py-1 text-sm rounded-md ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/40"
                      }`
                    }
                  >
                    Network Protection
                  </NavLink>
                  <NavLink
                    to="/security/arsrules"
                    className={({ isActive }) =>
                      `block px-2 py-1 text-sm rounded-md ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/40"
                      }`
                    }
                  >
                    ARS Rules
                  </NavLink>
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
