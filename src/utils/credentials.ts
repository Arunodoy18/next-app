import User from "@/models/userModel";

const ALPHA_NUM = "abcdefghijklmnopqrstuvwxyz0123456789";

export async function generateUsername(name: string): Promise<string> {
  const parts = name.trim().split(/\s+/);
  const first2 = (parts[0] || "").substring(0, 2).toLowerCase();
  const last2 = (parts[1] || "").substring(0, 2).toLowerCase();
  const prefix = first2 + last2;

  let username: string;
  do {
    let suffix = "";
    for (let i = 0; i < 4; i++) suffix += ALPHA_NUM[Math.floor(Math.random() * ALPHA_NUM.length)];
    username = prefix + suffix;
  } while (await User.findOne({ username }));

  return username;
}

export function generatePassword(): string {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = "!@#$%&*?";
  const all = lower + upper + digits + special;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const guaranteed = [pick(lower), pick(upper), pick(digits), pick(special)];
  const rest = Array.from({ length: 4 }, () => pick(all));
  return [...guaranteed, ...rest].sort(() => Math.random() - 0.5).join("");
}
