import { NextResponse } from "next/server";
import countriesEnData from "./countriesEn.json";
import { countryTypes } from "@/libs/types/types";

export async function GET() {
  try {
    // Convert the countriesEnData object to an array of countries
    const countriesArray = Object.entries(countriesEnData).map(
      ([code, countryData]) => ({
        code,
        ...countryData,
      })
    );

    return NextResponse.json(countriesArray, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch countries data" },
      { status: 500 }
    );
  }
}

// Get a specific country by its ISO alpha-2 code
export async function POST(request: Request) {
  try {
    // Get form data instead of JSON
    const formData = await request.formData();
    const countryCode = formData.get("code")?.toString();

    if (!countryCode) {
      return NextResponse.json(
        { error: "Country code is required" },
        { status: 400 }
      );
    }

    // Convert to uppercase to make it case-insensitive
    const normalizedCode = countryCode.toUpperCase();

    // Find the country by normalized code
    const country = Object.entries(countriesEnData).find(
      ([key]) => key.toUpperCase() === normalizedCode
    );

    if (!country) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    return NextResponse.json(country[1] as countryTypes, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
