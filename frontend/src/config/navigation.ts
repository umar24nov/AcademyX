import type { NavItem } from "@/lib/types";

export const navSections: Record<"main" | "manage", NavItem[]> = {
  main: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT", "SUPER_ADMIN"], section: "main" },
  ],
  manage: [
    { label: "Curriculum", href: "/curriculum/courses", icon: "menu_book", roles: ["INSTITUTE_ADMIN", "TEACHER", "SUPER_ADMIN"], section: "manage" },
    { label: "Courses", href: "/courses", icon: "menu_book", roles: ["STUDENT"], section: "manage" },
    { label: "Batches", href: "/batches", icon: "group", roles: ["INSTITUTE_ADMIN", "TEACHER", "SUPER_ADMIN"], section: "manage" },
    { label: "Students", href: "/students", icon: "school", roles: ["INSTITUTE_ADMIN", "TEACHER", "SUPER_ADMIN"], section: "manage" },
    { label: "Teachers", href: "/teachers", icon: "admin_panel_settings", roles: ["INSTITUTE_ADMIN", "SUPER_ADMIN"], section: "manage" },
    { label: "Live Classes", href: "/live-classes", icon: "video", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"], section: "manage" },
    { label: "Recorded Lectures", href: "/lectures", icon: "play_circle", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"], section: "manage" },
    { label: "Exams", href: "/exams", icon: "assignment", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"], section: "manage" },
    { label: "Assignments", href: "/assignments", icon: "list_alt", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"], section: "manage" },
    { label: "Financials", href: "/financials", icon: "payments", roles: ["INSTITUTE_ADMIN", "SUPER_ADMIN"], section: "manage" },
    { label: "Reports", href: "/reports", icon: "bar_chart", roles: ["INSTITUTE_ADMIN", "TEACHER", "SUPER_ADMIN"], section: "manage" },
    { label: "Messages", href: "/messages", icon: "forum", roles: ["INSTITUTE_ADMIN", "TEACHER", "STUDENT"], section: "manage" },
    { label: "Institutes", href: "/institutes", icon: "domain", roles: ["SUPER_ADMIN"], section: "manage" },
  ],
};

export function getNavForRole(role: string, section: "main" | "manage"): NavItem[] {
  return navSections[section].filter((item) => item.roles.includes(role as never));
}

export function getAllNav(role: string): NavItem[] {
  return [...navSections.main, ...navSections.manage].filter((item) =>
    item.roles.includes(role as never)
  );
}
