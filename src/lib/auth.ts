// Lightweight demo auth backed by localStorage. Three fixed accounts, all
// using the password "123". Real apps would never do this — it's a mock.
export type AuthRole = "student" | "instructor" | "admin";

interface Account {
  password: string;
  role: AuthRole;
  home: string;
}

const ACCOUNTS: Record<string, Account> = {
  student: { password: "123", role: "student", home: "/dashboard" },
  instructor: { password: "123", role: "instructor", home: "/instructor" },
  admin: { password: "123", role: "admin", home: "/admin" },
};

const USER_KEY = "user";
const ROLE_KEY = "role";

/** Validate credentials. Returns the matched account, or null. */
export function authenticate(userId: string, password: string) {
  const account = ACCOUNTS[userId.trim().toLowerCase()];
  if (!account || account.password !== password) return null;
  return { userId: userId.trim().toLowerCase(), ...account };
}

export function login(userId: string, role: AuthRole) {
  localStorage.setItem(USER_KEY, userId);
  localStorage.setItem(ROLE_KEY, role);
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getRole(): AuthRole | null {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(ROLE_KEY) as AuthRole | null) ?? null;
}
