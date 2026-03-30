export type Stage = 'leads' | 'qualify' | 'message' | 'call' | 'audit' | 'closing' | 'onboard';
export type Status = 'Active' | 'Won' | 'Archive' | 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type Source = 'LinkedIn' | 'Facebook Groups' | 'Cold Scraping' | 'Referral' | string;

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: Source;
  stage: Stage;
  status: Status;
  budget: string;
  salesperson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLeadInput = Partial<CreateLeadInput>;
