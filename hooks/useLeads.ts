'use client';
import useSWR from 'swr';
import type { Lead, CreateLeadInput, UpdateLeadInput } from '@/types/lead';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useLeads() {
  const { data, error, isLoading, mutate } = useSWR<{ leads: Lead[] }>('/api/leads', fetcher, { refreshInterval: 30000 });

  async function addLead(input: CreateLeadInput): Promise<Lead> {
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'فشل');
    await mutate();
    return json.lead;
  }

  async function editLead(id: string, input: UpdateLeadInput): Promise<Lead> {
    const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'فشل');
    await mutate();
    return json.lead;
  }

  async function removeLead(id: string): Promise<void> {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'فشل');
    await mutate();
  }

  return { leads: data?.leads ?? [], isLoading, isError: !!error, addLead, editLead, removeLead, refresh: mutate };
}
