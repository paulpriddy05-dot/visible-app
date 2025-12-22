import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sheetUrl, cell } = await req.json(); // Expects: "https://...", "B2"

    // 1. Extract ID from URL
    const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!idMatch) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    const spreadsheetId = idMatch[1];

    // 2. Setup Google Auth (Uses your existing ENV key)
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });

    // 3. Fetch specific cell
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: cell, // e.g., "Sheet1!B2" or just "B2"
    });

    const value = response.data.values?.[0]?.[0] || "—";

    return NextResponse.json({ value });
  } catch (error: any) {
    console.error("Sheet API Error:", error);
    return NextResponse.json({ value: "Error" }, { status: 500 });
  }
}