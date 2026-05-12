export interface FactCheck {
  id: string;
  claim: string;
  verdict: 'True' | 'False' | 'Misleading';
  explanation: string;
  links: string[];
  created_at: string;
}