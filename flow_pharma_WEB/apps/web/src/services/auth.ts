import { apiRequest, ApiError, ApiCodes } from "./http";
import type { AuthResponse, LoginRequest, RegisterRequest, ApiUser } from "@/types/auth";
import type { Role } from "@/types/common";

const USERS_KEY = "flow-users";
const SESSION_KEY = "flow-session";

interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone: string;
  language: string;
  password: string;
  createdAt: string;
}

const seedUsers: StoredUser[] = [
  { id: "usr-customer", email: "customer@flowpharma.local", fullName: "Rahul Sharma", role: "CUSTOMER", phone: "+91 98765 43210", language: "en", password: "demo1234", createdAt: new Date().toISOString() },
  { id: "usr-seller", email: "seller@flowpharma.local", fullName: "Dr. Vikram Patel", role: "SELLER", phone: "+91 98220 33445", language: "en", password: "demo1234", createdAt: new Date().toISOString() },
  { id: "usr-admin", email: "admin@flowpharma.local", fullName: "Platform Administrator", role: "SUPER_ADMIN", phone: "+91 99000 11000", language: "en", password: "demo1234", createdAt: new Date().toISOString() },
  { id: "usr-pharmacist", email: "pharmacist@flowpharma.local", fullName: "Dr. Pooja Mehta", role: "PHARMACIST_REVIEWER", phone: "+91 99000 22000", language: "en", password: "demo1234", createdAt: new Date().toISOString() },
];

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return seedUsers;
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return seedUsers;
  }
}

function writeUsers(users: StoredUser[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function toApiUser(u: StoredUser): ApiUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    language: u.language,
    phone: u.phone,
    createdAt: u.createdAt,
  };
}

export function getStoredSession(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

function setSession(user: ApiUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(SESSION_KEY);
}

export const authService = {
  login(req: LoginRequest): Promise<AuthResponse> {
    return apiRequest({
      url: "/api/v1/auth/login",
      method: "POST",
      body: req,
      mock: async () => {
        const users = readUsers();
        const user = users.find((u) => u.email.toLowerCase() === req.email.trim().toLowerCase());
        if (!user || user.password !== req.password) {
          throw new ApiError(ApiCodes.UNAUTHORIZED, "Invalid email or password.");
        }
        const apiUser = toApiUser(user);
        setSession(apiUser);
        const redirectTo = user.role === "SELLER" ? "/seller" : user.role === "SUPER_ADMIN" ? "/admin" : "/app";
        return { session: { user: apiUser, accessToken: "demo-token", expiresAt: new Date().toISOString() }, redirectTo, demo: true };
      },
    });
  },

  register(req: RegisterRequest): Promise<AuthResponse> {
    return apiRequest({
      url: "/api/v1/auth/register",
      method: "POST",
      body: req,
      mock: async () => {
        const users = readUsers();
        if (users.some((u) => u.email.toLowerCase() === req.email.trim().toLowerCase())) {
          throw new ApiError(ApiCodes.VALIDATION, "An account with this email already exists.");
        }
        const role: Role = req.accountType === "SELLER" ? "SELLER" : "CUSTOMER";
        const newUser: StoredUser = {
          id: `usr-${Math.random().toString(36).slice(2, 8)}`,
          email: req.email.trim(),
          fullName: req.name,
          role,
          phone: req.phone,
          language: req.preferredLanguage || "en",
          password: req.password,
          createdAt: new Date().toISOString(),
        };
        writeUsers([...users, newUser]);
        const apiUser = toApiUser(newUser);
        setSession(apiUser);
        return { session: { user: apiUser, accessToken: "demo-token", expiresAt: new Date().toISOString() }, redirectTo: role === "SELLER" ? "/seller" : "/app", demo: true };
      },
    });
  },

  logout(): void {
    setSession(null);
  },

  current(): ApiUser | null {
    return getStoredSession();
  },

  updateProfile(patch: Partial<Pick<ApiUser, "fullName" | "email" | "phone" | "language">>): Promise<ApiUser> {
    return apiRequest({
      url: "/api/v1/auth/me",
      method: "PATCH",
      body: patch,
      mock: async () => {
        const current = getStoredSession();
        if (!current) throw new ApiError(ApiCodes.UNAUTHORIZED, "Not signed in.");
        const users = readUsers();
        const idx = users.findIndex((u) => u.id === current.id);
        if (idx === -1) throw new ApiError(ApiCodes.NOT_FOUND, "User not found.");
        const updated = { ...users[idx], ...patch };
        users[idx] = updated;
        writeUsers(users);
        const apiUser = toApiUser(updated);
        setSession(apiUser);
        return apiUser;
      },
    });
  },

  listAll(): ApiUser[] {
    return readUsers().map(toApiUser);
  },
};

export const demoCredentials = [
  { email: "customer@flowpharma.local", password: "demo1234", label: "Customer", href: "/app" },
  { email: "seller@flowpharma.local", password: "demo1234", label: "Seller", href: "/seller" },
  { email: "admin@flowpharma.local", password: "demo1234", label: "Admin", href: "/admin" },
];
