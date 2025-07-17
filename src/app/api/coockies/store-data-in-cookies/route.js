import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();

    const response = NextResponse.json({
      success: true,
      message: "Data stored in cookies successfully",
    });

    // Set each key-value pair as a cookie
    Object.entries(data).forEach(([key, value]) => {
      response.cookies.set(key, JSON.stringify(value), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to store data in cookies", error },
      { status: 400 }
    );
  }
}
