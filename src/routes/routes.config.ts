import type { UserRole } from "../dataTypes/roles";

export interface AppRouteConfig {
  path: string;
  name: string;
  protected: boolean;
  roles?: UserRole[];
}

export const adminSubPageRoles: Record<string, UserRole[]> = {
  "award-categories": ["admin"],
  "entities-departments": ["admin"],
  "nomination-cycle": ["admin"],
  "jury-panel-setup": ["admin"],
  "jury-evaluation-settings": ["admin"],
  "jury-role-mapping": ["admin"],
  "role-list": ["admin"],
};

export const getRoutes = (): AppRouteConfig[] => {
  return [
    {
      path: "/",
      name: "Login",
      protected: false,
    },
    {
      path: "/home",
      name: "Home",
      protected: true,
    },
    {
      path: "/notifications",
      name: "Notifications",
      protected: true,
    },
    {
      path: "/self-nominations",
      name: "Self Nominations",
      protected: true,
    },
    {
      path: "/my-nominations",
      name: "My Nominations",
      protected: true,
    },
    {
      path: "/my-nominations/add-nomination",
      name: "Add Nomination",
      protected: true,
    },
    {
      path: "/approvals",
      name: "Approvals",
      protected: true,
    },
    {
      path: "/admin-setting",
      name: "Admin Setting",
      protected: true,
      roles: ["admin"],
    },
    ...Object.entries(adminSubPageRoles).map(([slug, roles]) => ({
      path: `/admin-setting/${slug}`,
      name: slug,
      protected: true,
      roles,
    })),
  ];
};

export const routes = getRoutes();
