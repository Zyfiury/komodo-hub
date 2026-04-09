import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/constants";
import type { UserRoleValue } from "@/lib/constants";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const redirectMap: Record<string, string> = {
  FOUNDATION_ADMIN: "/dashboard/foundation",
  SCHOOL_ADMIN: "/dashboard/school",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  COMMUNITY_ADMIN: "/dashboard/community",
  COMMUNITY_MEMBER: "/dashboard/community",
};

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signSession({
    sub: user.id,
    email: user.email,
    role: user.role as UserRoleValue,
    organisationId: user.organisationId,
  });

  const out = NextResponse.json({
    ok: true,
    role: user.role,
    redirect: redirectMap[user.role] ?? "/",
  });
  out.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return out;
}
