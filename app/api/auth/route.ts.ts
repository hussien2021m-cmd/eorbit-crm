import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'غير مسجل' }, { status: 401 });
  try {
    const user = JSON.parse(token);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'غير صالح' }, { status: 401 });
  }
}
