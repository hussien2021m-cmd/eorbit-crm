import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead, ensureHeaders } from '@/lib/sheets';

export async function GET() {
  try {
    await ensureHeaders();
    const leads = await getAllLeads();
    return NextResponse.json({ leads });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'فشل في جلب الـ leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    await ensureHeaders();
    const lead = await createLead({
      name:        body.name?.trim()        ?? '',
      company:     body.company?.trim()     ?? '',
      phone:       body.phone?.trim()       ?? '',
      email:       body.email?.trim()       ?? '',
      source:      body.source              ?? '',
      stage:       body.stage               ?? 'leads',
      status:      body.status              ?? 'Active',
      budget:      body.budget?.trim()      ?? '',
      salesperson: body.salesperson?.trim() ?? '',
      notes:       body.notes?.trim()       ?? '',
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'فشل في الإضافة' }, { status: 500 });
  }
}
