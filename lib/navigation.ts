import {
  LayoutDashboard,
  Gauge,
  AlertTriangle,
  PieChart,
  SearchCode,
  Clock,
  Boxes,
  ShieldCheck,
  Flame,
  Cpu,
  Wrench,
  CheckSquare,
  Bot,
  Settings,
  Activity,
  Layers,
  Sliders,
} from 'lucide-react';

export interface SubTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: any;
  badgeKey?: 'alerts' | 'tasks';
}

export interface NavHub {
  id: string;
  label: string;
  description: string;
  icon: any;
  defaultTab: string;
  subTabs: SubTabItem[];
}

export const NAV_HUBS: NavHub[] = [
  {
    id: 'operations',
    label: 'Operations',
    description: 'Real-time production, lines and shift alerts',
    icon: LayoutDashboard,
    defaultTab: 'dashboard',
    subTabs: [
      { id: 'dashboard', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
      { id: 'production', label: 'Lines', shortLabel: 'Lines', icon: Gauge },
      { id: 'alerts', label: 'Alerts', shortLabel: 'Alerts', icon: AlertTriangle, badgeKey: 'alerts' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'OEE loss breakdown and root-cause investigations',
    icon: PieChart,
    defaultTab: 'loss-explorer',
    subTabs: [
      { id: 'loss-explorer', label: 'Losses', shortLabel: 'Losses', icon: PieChart },
      { id: 'investigations', label: 'Investigations', shortLabel: 'Investigations', icon: SearchCode },
      { id: 'downtime', label: 'Downtime', shortLabel: 'Downtime', icon: Clock },
    ],
  },
  {
    id: 'materials',
    label: 'Materials',
    description: 'Raw ingredients, scrap, and defect correlation',
    icon: Layers,
    defaultTab: 'materials',
    subTabs: [
      { id: 'materials', label: 'Inventory', shortLabel: 'Inventory', icon: Boxes },
      { id: 'quality', label: 'Quality', shortLabel: 'Quality', icon: ShieldCheck },
      { id: 'waste-energy', label: 'Waste', shortLabel: 'Waste', icon: Flame },
    ],
  },
  {
    id: 'equipment',
    label: 'Equipment',
    description: 'Machine telemetry, maintenance and action tasks',
    icon: Cpu,
    defaultTab: 'machines',
    subTabs: [
      { id: 'machines', label: 'Machines', shortLabel: 'Machines', icon: Cpu },
      { id: 'maintenance', label: 'Maintenance', shortLabel: 'Maintenance', icon: Wrench },
      { id: 'actions', label: 'Actions', shortLabel: 'Actions', icon: CheckSquare, badgeKey: 'tasks' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'AI factory copilot and configuration thresholds',
    icon: Sliders,
    defaultTab: 'ai-assistant',
    subTabs: [
      { id: 'ai-assistant', label: 'Copilot', shortLabel: 'Copilot', icon: Bot },
      { id: 'settings', label: 'Configuration', shortLabel: 'Configuration', icon: Settings },
    ],
  },
];

// Helper to find parent hub for any active tab
export function getHubForTab(tabId: string): NavHub {
  const found = NAV_HUBS.find((hub) => hub.subTabs.some((sub) => sub.id === tabId));
  return found || NAV_HUBS[0];
}
