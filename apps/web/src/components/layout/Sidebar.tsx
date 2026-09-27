import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard, Users, UserCog, Building2, Layers, BookOpen,
  CalendarDays, GraduationCap, FileCheck2, ClipboardList, Award,
  BarChart3, ShieldCheck, X, Package, ListTodo, Target,
  BookMarked, UserPlus, Clock
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth();

  const adminLinks: NavItem[] = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Campuses', to: '/admin/campuses', icon: Building2 },
    { name: 'Categories', to: '/admin/categories', icon: Layers },
    { name: 'Electives', to: '/admin/electives', icon: BookOpen },
    { name: 'Trainers', to: '/admin/trainers', icon: UserCog },
    { name: 'Trainees', to: '/admin/trainees', icon: Users },
    { name: 'Batches', to: '/admin/batches', icon: CalendarDays },
    { name: 'Skills', to: '/admin/skills', icon: ShieldCheck },
    { name: 'Sessions', to: '/admin/sessions', icon: Clock },
    { name: 'Attendance', to: '/admin/attendance', icon: ClipboardList },
    { name: 'Products', to: '/admin/products', icon: Package },
    { name: 'Assessments', to: '/admin/assessments', icon: FileCheck2 },
    { name: 'Certificates', to: '/admin/certificates', icon: Award },
    { name: 'Reports', to: '/admin/reports', icon: BarChart3 },
  ];

  const trainerLinks: NavItem[] = [
    { name: 'Dashboard', to: '/trainer/dashboard', icon: LayoutDashboard },
    { name: 'My Batches', to: '/trainer/batches', icon: CalendarDays },
    { name: 'Sessions', to: '/trainer/sessions', icon: Clock },
    { name: 'Attendance', to: '/trainer/attendance', icon: ClipboardList },
    { name: 'Tasks', to: '/trainer/tasks', icon: ListTodo },
    { name: 'Products', to: '/trainer/products', icon: Package },
    { name: 'Assessments', to: '/trainer/assessments', icon: FileCheck2 },
    { name: 'Skills', to: '/trainer/skills', icon: ShieldCheck },
  ];

  const traineeLinks: NavItem[] = [
    { name: 'Dashboard', to: '/trainee/dashboard', icon: LayoutDashboard },
    { name: 'Schedule', to: '/trainee/schedule', icon: CalendarDays },
    { name: 'Attendance', to: '/trainee/attendance', icon: ClipboardList },
    { name: 'Skills', to: '/trainee/skills', icon: Target },
    { name: 'Tasks', to: '/trainee/tasks', icon: ListTodo },
    { name: 'Products', to: '/trainee/products', icon: Package },
    { name: 'Assessments', to: '/trainee/assessments', icon: FileCheck2 },
    { name: 'Certificates', to: '/trainee/certificates', icon: Award },
    { name: 'Skill Passport', to: '/trainee/skill-passport', icon: GraduationCap },
  ];

  const getLinks = (): NavItem[] => {
    switch (user?.role) {
      case 'ADMIN':
      case 'CENTRE_ADMIN':
        return adminLinks;
      case 'TRAINER': return trainerLinks;
      case 'TRAINEE': return traineeLinks;
      default: return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-indigo-950">
            <div>
              <span className="text-xl font-bold tracking-wider">KISS V-TRACK</span>
              <p className="text-[10px] text-indigo-300 tracking-wide">Vocational Skill Tracking</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-indigo-200 hover:text-white" aria-label="Close sidebar">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-0.5" aria-label="Main navigation">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md group transition-colors",
                      isActive
                        ? "bg-indigo-800 text-white"
                        : "text-indigo-100 hover:bg-indigo-800/60 hover:text-white"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 bg-indigo-950">
            <div className="text-xs text-indigo-300 text-center">
              <p className="font-medium">Learn. Practice. Create.</p>
              <p className="mt-0.5 text-indigo-400">Get Skilled.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
