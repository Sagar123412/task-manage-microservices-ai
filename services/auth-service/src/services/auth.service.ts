import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  UserRole,
} from "@task-manager/shared";
import { getLogger, HttpError } from "@task-manager/shared/server";
import { getAuthRepository } from "../repositories/auth.repository.js";

const log = getLogger();

type AuthConfig = {
  jwtAccessSecret: string;
  jwtAccessExpiresIn: SignOptions["expiresIn"];
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: SignOptions["expiresIn"];
  refreshTokenTtlDays: number;
};

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};

function hashRefreshToken(refreshToken: string): string {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

export class AuthService {
  constructor(
    private readonly config: AuthConfig,
    private readonly repository = getAuthRepository()
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new HttpError("Email already registered", 409);
    }

    const created = await this.repository.createUser({
      email: input.email,
      password: await bcrypt.hash(input.password, 12),
      role: input.role ?? "user",
    });

    log.info("auth_user_registered", { userId: created.id });
    await this.repository.createAuditLog({
      userId: created.id,
      action: "auth.register",
      metadata: { role: created.role },
    });
    return this.issueTokenPair(created.id, created.email, created.role);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.repository.findByEmail(input.email);
    if (!user) {
      throw new HttpError("Incorrect credentials", 401);
    }
    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      throw new HttpError("Incorrect credentials", 401);
    }

    log.info("auth_user_logged_in", { userId: user.id });
    await this.repository.createAuditLog({
      userId: user.id,
      action: "auth.login",
    });
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async refresh(input: RefreshTokenInput): Promise<AuthResult> {
    let payload: { sub: string; email: string; role: UserRole };
    try {
      payload = jwt.verify(input.refreshToken, this.config.jwtRefreshSecret) as {
        sub: string;
        email: string;
        role: UserRole;
      };
    } catch {
      throw new HttpError("Invalid or expired refresh token", 401);
    }

    const refreshTokenHash = hashRefreshToken(input.refreshToken);
    const session = await this.repository.findActiveSessionByToken(refreshTokenHash);
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new HttpError("Invalid or expired refresh token", 401);
    }

    const user = await this.repository.findUserById(payload.sub);
    if (!user) {
      throw new HttpError("Invalid refresh token subject", 401);
    }

    await this.repository.revokeSessionByToken(refreshTokenHash);
    await this.repository.createAuditLog({
      userId: user.id,
      action: "auth.refresh",
    });
    return this.issueTokenPair(user.id, user.email, user.role);
  }

  async logout(input: LogoutInput): Promise<void> {
    const refreshTokenHash = hashRefreshToken(input.refreshToken);
    const session = await this.repository.findActiveSessionByToken(refreshTokenHash);
    if (session) {
      await this.repository.revokeSessionByToken(refreshTokenHash);
      await this.repository.createAuditLog({
        userId: session.userId,
        action: "auth.logout",
      });
    }
  }

  private async issueTokenPair(id: string, email: string, role: UserRole): Promise<AuthResult> {
    const accessToken = jwt.sign({ sub: id, email, role }, this.config.jwtAccessSecret, {
      expiresIn: this.config.jwtAccessExpiresIn,
    });
    const refreshToken = jwt.sign({ sub: id, email, role }, this.config.jwtRefreshSecret, {
      expiresIn: this.config.jwtRefreshExpiresIn,
    });
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
    await this.repository.createSession({ userId: id, refreshToken: refreshTokenHash, expiresAt });

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      user: { id, email, role },
    };
  }
}

let authService: AuthService | null = null;

export function getAuthService(config: AuthConfig): AuthService {
  if (!authService) {
    authService = new AuthService(config);
  }
  return authService;
}
