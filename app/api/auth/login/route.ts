import { NextRequest, NextResponse } from 'next/server';

const USERS = [
  { username: 'hussienxeorbit',  password: 'eorbit2664', name: 'حسين'  },
  { username: 'mohamedxeorbit', password: 'eorbit3536', name: 'محمد'  },
  { username: 'esraaxeorbit',   password: 'eorbit5823', name: 'إسراء' },
  { username: 'rahmaxeorbit',   password: 'eorbit1473', name: 'رحمة'  },
  { username: 'hagerxeorbit',   password: 'eorbit0294', name: 'هاجر'  },
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // نحاول نقرأ من الـ env أول
    let users = USERS;
    const envUsers = process.env.USERS_JSON;
    if (envUsers) {
      try {
        const parsed = JSON.parse(envUsers);
        if (Array.isArray(parsed) && parsed.length > 0) users = parsed;
      } catch { /* نفضل على الـ default */ }
    }

    const user = users.find(u => u.username === username?.trim() && u.password === password?.trim());

    if (!user) {
      return NextResponse.json({ error: 'اسم المستخدم أو الباسورد غلط' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, name: user.name, username: user.username });
    res.cookies.set('auth_token', JSON.stringify({ username: user.username, name: user.name }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 });
  }
}
