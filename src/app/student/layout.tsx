import { AppShell } from '@/components/layout/app-shell';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  User,
} from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';
import RoleGuardClient from '@/components/RoleGuardClient';
import InnerAppShellClient from '@/components/InnerAppShellClient';

const studentNavItems = [
  { href: '/student', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/student/profile', label: 'Profile', icon: <User /> },
  { href: '/student/courses', label: 'My Courses', icon: <BookOpen /> },
  { href: '/student/assessments', label: 'Assessments', icon: <GraduationCap /> },
];

const user = {
  name: 'Alex Johnson',
  email: 'alex.j@university.edu',
  avatar: 'https://i.pravatar.cc/150?u=student-1',
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RoleGuardClient is client; InnerAppShellClient renders AppShell using profile
  return (
    <ClientOnly>
      <RoleGuardClient requiredRole="student">
        <InnerAppShellClient role="student">
          {children}
        </InnerAppShellClient>
      </RoleGuardClient>
    </ClientOnly>
  );
}
