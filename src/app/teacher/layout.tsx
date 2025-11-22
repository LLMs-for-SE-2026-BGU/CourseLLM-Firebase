import { AppShell } from '@/components/layout/app-shell';
import {
  BarChart2,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
} from 'lucide-react';

const teacherNavItems = [
  { href: '/teacher', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/teacher/courses', label: 'Courses', icon: <BookOpen /> },
  { href: '/teacher/quizzes', label: 'Quizzes', icon: <ClipboardList /> },
];

const user = {
  name: 'Dr. Evelyn Reed',
  email: 'e.reed@university.edu',
  avatar: 'https://i.pravatar.cc/150?u=teacher-1',
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell navItems={teacherNavItems} user={user}>
      {children}
    </AppShell>
  );
}
