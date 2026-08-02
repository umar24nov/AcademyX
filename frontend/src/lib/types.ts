export type Role = "SUPER_ADMIN" | "INSTITUTE_ADMIN" | "TEACHER" | "STUDENT";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
  section?: "main" | "manage" | "bottom";
};

export type UserSession = {
  id: string;
  name: string;
  email: string;
  role: Role;
  instituteId?: string | null;
  instituteName?: string | null;
  avatar?: string | null;
};
