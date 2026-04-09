import type { UserRole } from "@task-manager/shared";

export interface AuthUserEntity {
  id: string;
  email: string;
  password: string;
  roleId: string;
  role: UserRole;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  createdAt: Date;
}
