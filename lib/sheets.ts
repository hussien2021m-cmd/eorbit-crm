import { google } from 'googleapis';
import type { Lead, CreateLeadInput, UpdateLeadInput } from '@/types/lead';

const SHEET_NAME = 'Leads';
const HEADERS = ['id','name','company','phone','email','source','stage','status','budget','salesperson','notes','createdAt','updatedAt'];

function getAuth() {
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/"/g, '');

  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

function rowToLead(row: string[]): Lead {
  return {
    id:          row[0]  ?? '',
    name:        row[1]  ?? '',
    company:     row[2]  ?? '',
    phone:       row[3]  ?? '',
    email:       row[4]  ?? '',
    source:      row[5]  ?? '',
    stage:       row[6]  ?? 'leads',
    status:      row[7]  ?? 'Active',
    budget:      row[8]  ?? '',
    salesperson: row[9]  ?? '',
    notes:       row[10] ?? '',
    createdAt:   row[11] ?? '',
    updatedAt:   row[12] ?? '',
  };
}

function leadToRow(l: Lead): string[] {
  return [l.id, l.name, l.company, l.phone, l.email, l.source, l.stage, l.status, l.budget, l.salesperson, l.notes, l.createdAt, l.updatedAt];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const SHEET_ID = () => process.env.GOOGLE_SHEET_ID!;
const RANGE = `${SHEET_NAME}!A:M`;

export async function ensureHeaders() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID(), range: `${SHEET_NAME}!A1:M1` });
  if (!res.data.values?.[0] || res.data.values[0][0] !== 'id') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID(), range: `${SHEET_NAME}!A1:M1`,
      valueInputOption: 'RAW', requestBody: { values: [HEADERS] },
    });
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID(), range: RANGE });
  return (res.data.values ?? []).slice(1).filter(r => r[0]).map(rowToLead);
}

export async function createLead(data: CreateLeadInput): Promise<Lead> {
  const sheets = await getSheets();
  const lead: Lead = { ...data, id: uid(), createdAt: new Date().toISOString(), updatedAt: '' };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID(), range: RANGE,
    valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [leadToRow(lead)] },
  });
  return lead;
}

export async function updateLead(id: string, data: UpdateLeadInput): Promise<Lead | null> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID(), range: RANGE });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return null;
  const updated: Lead = { ...rowToLead(rows[rowIndex]), ...data, id, updatedAt: new Date().toISOString() };
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID(),
    range: `${SHEET_NAME}!A${rowIndex + 1}:M${rowIndex + 1}`,
    valueInputOption: 'RAW', requestBody: { values: [leadToRow(updated)] },
  });
  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const sheets = await getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID() });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  if (!sheet?.properties?.sheetId && sheet?.properties?.sheetId !== 0) return false;
  const numericSheetId = sheet.properties!.sheetId!;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID(), range: RANGE });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return false;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID(),
    requestBody: { requests: [{ deleteDimension: { range: { sheetId: numericSheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 } } }] },
  });
  return true;
}
