import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  FileText, 
  Settings, 
  ChevronDown,
  ChevronRight,
  BarChart3,
  Calendar,
  Award,
  User
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [
      {
        name: 'Dashboard',
        icon: <Home size={20} />,
        href: '/dashboard'
      }
    ];

    if (hasRole('ROLE_ADMIN')) {
      items.push(
        {
          name: 'Admin',
          icon: <Settings size={20} />,
          href: '#',
          children: [
            { name: 'Statistics', icon: <BarChart3 size={16} />, href: '/admin/stats' },
            { name: 'User Management', icon: <Users size={16} />, href: '/admin/users' }
          ]
        }
      );
    }

    if (hasRole('ROLE_HR')) {
      items.push(
        {
          name: 'HR Management',
          icon: <Users size={20} />,
          href: '#',
          children: [
            { name: 'Employees', icon: <Users size={16} />, href: '/hr/employees' },
            { name: 'Projects', icon: <Briefcase size={16} />, href: '/hr/projects' },
            { name: 'Leave Requests', icon: <Calendar size={16} />, href: '/hr/leaves' }
          ]
        }
      );
    }

    if (hasRole('ROLE_MANAGER')) {
      items.push(
        {
          name: 'Manager',
          icon: <Briefcase size={20} />,
          href: '#',
          children: [
            { name: 'My Projects', icon: <Briefcase size={16} />, href: '/manager/projects' },
            { name: 'Team Members', icon: <Users size={16} />, href: '/manager/team' },
            { name: 'Performance', icon: <Award size={16} />, href: '/manager/performance' },
            { name: 'Leave Approvals', icon: <Calendar size={16} />, href: '/manager/leaves' }
          ]
        }
      );
    }

    if (hasRole('ROLE_EMPLOYEE')) {
      items.push(
        {
          name: 'Employee',
          icon: <User size={20} />,
          href: '#',
          children: [
            { name: 'My Profile', icon: <User size={16} />, href: '/employee/profile' },
            { name: 'Leave Requests', icon: <Calendar size={16} />, href: '/employee/leaves' },
            { name: 'Performance', icon: <Award size={16} />, href: '/employee/performance' },
            { name: 'Documents', icon: <FileText size={16} />, href: '/employee/documents' }
          ]
        }
      );
    }

    return items;
  };

  const renderMenuItem = (item: MenuItem) => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.name}>
        <button
          onClick={() => hasChildren ? toggleExpanded(item.name) : undefined}
          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </div>
          {hasChildren && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 space-y-1">
            {item.children!.map(child => (
              <a
                key={child.name}
                href={child.href}
                className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              >
                {child.icon}
                <span>{child.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">WorkSphere</span>
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-2">
          {getMenuItems().map(renderMenuItem)}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 