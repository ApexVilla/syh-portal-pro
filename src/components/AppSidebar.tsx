import { LayoutDashboard, ShoppingCart, Users, Package, FileText, CreditCard, Truck } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const groups = [
  {
    label: 'Principal',
    items: [
      { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Comercial',
    items: [
      { title: 'Vendas', url: '/vendas', icon: ShoppingCart },
      { title: 'Clientes', url: '/clientes', icon: Users },
      { title: 'Proveedores', url: '/proveedores', icon: Truck },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { title: 'CXC', url: '/cxc', icon: FileText },
      { title: 'CXP', url: '/cxp', icon: CreditCard },
    ]
  },
  {
    label: 'Operacional',
    items: [
      { title: 'Inventario', url: '/estoque', icon: Package },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <img src="/logo.png" alt="Portal" className="w-8 h-8 rounded-lg object-cover" />
        {!collapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight">SYH Portal</span>
        )}
      </div>
      <SidebarContent className="py-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-2">
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
