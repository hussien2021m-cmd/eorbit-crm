export type Stage = string;
export type Status = string;
export type Source = string;

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  stage: string;
  status: string;
  budget: string;
  salesperson: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLeadInput = Partial<CreateLeadInput>;
