import type { UserRole } from "@task-manager/shared";
import type { Prisma } from "@prisma/client";
import type { AuthUserEntity } from "../domain/auth-user.entity.js";
import { getPrismaClient } from "../lib/prisma.js";

export class AuthRepository {
  constructor(private readonly prisma = getPrismaClient()) {}

  private toEntity(row: {
    id: string;
    email: string;
    password: string;
    roleId: string;
    role: { name: string };
    createdAt: Date;
  }): AuthUserEntity {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      roleId: row.roleId,
      role: row.role.name === "admin" ? "admin" : "user",
      createdAt: row.createdAt,
    };
  }

  async findByEmail(email: string): Promise<AuthUserEntity | null> {
    const row = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async createUser(input: {
    email: string;
    password: string;
    role: UserRole;
  }): Promise<AuthUserEntity> {
    const row = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: input.password,
        role: {
          connectOrCreate: {
            where: { name: input.role },
            create: { name: input.role },
          },
        },
      },
      include: { role: true },
    });
    return this.toEntity(row);
  }

  async findUserById(id: string): Promise<AuthUserEntity | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async createSession(input: {
    userId: string;
    refreshToken: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId: input.userId,
        refreshToken: input.refreshToken,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findActiveSessionByToken(refreshToken: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
  } | null> {
    const row = await this.prisma.session.findUnique({
      where: { refreshToken },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
      },
    });
    if (!row) return null;
    return row;
  }

  async revokeSessionByToken(refreshToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createAuditLog(input: {
    userId?: string;
    action: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        metadata: input.metadata,
      },
    });
  }
}

let authRepository: AuthRepository | null = null;

export function getAuthRepository(): AuthRepository {
  if (!authRepository) {
    authRepository = new AuthRepository();
  }
  return authRepository;
}
