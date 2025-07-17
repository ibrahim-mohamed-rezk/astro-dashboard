import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });
  cookieStore.set("user", "", {
    httpOnly: false,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ message: "Logged out" });
}