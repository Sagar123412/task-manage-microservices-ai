import type { UserRole } from "@task-manager/shared";

export interface AuthUserEntity {
  id: string;
  email: string;
  password: string;
  roleId: string;
  role: UserRole;
  createdAt: Date;
}
