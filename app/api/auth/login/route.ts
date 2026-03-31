import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const usersRaw = process.env.USERS_JSON || '[]';
  let users: { username: string; password: string; name: string }[] = [];
  try { users = JSON.parse(usersRaw); } catch { users = []; }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return NextResponse.json({ error: 'اسم المستخدم أو الباسورد غلط' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, name: user.name, username: user.username });
  res.cookies.set('auth_token', JSON.stringify({ username: user.username, name: user.name }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 أيام
    path: '/',
  });
  return res;
}
