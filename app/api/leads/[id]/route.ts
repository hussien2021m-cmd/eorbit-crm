import { NextRequest, NextResponse } from 'next/server';
import { updateLead, deleteLead } from '@/lib/sheets';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateLead(id, body);
    if (!updated) return NextResponse.json({ error: 'Lead مش موجود' }, { status: 404 });
    return NextResponse.json({ lead: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'فشل في التعديل' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const ok = await deleteLead(id);
    if (!ok) return NextResponse.json({ error: 'Lead مش موجود' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'فشل في الحذف' }, { status: 500 });
  }
}
