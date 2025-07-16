import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { key } = data;

    if (!key) {
      return NextResponse.json(
        { success: false, message: "Key is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieValue = cookieStore.get(key);

    if (!cookieValue) {
      return NextResponse.json(
        { success: false, message: "Cookie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(cookieValue.value),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to get data from cookies", error },
      { status: 400 }
    );
  }
}
