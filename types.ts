// FIX: Removed circular and unnecessary import of 'Member'.
// The 'Member' interface is defined within this file.
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
}

export enum MemberStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum ProfileType {
  PRUDENT = 'PHR_Prudent',
  DYNAMIC = 'FLG_Dynamique',
}

export enum PortfolioType {
    PHRONESIS = 'Phronesis_Portfolio',
    FLAGSHIP = 'FlagShip_Portfolio'
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  exitDate?: string | null;
  investedCapital: number;
  shares: number;
  status: MemberStatus;
  profileType: ProfileType;
}

export interface Transaction {
  id:string;
  date: string;
  type: TransactionType;
  portfolio: PortfolioType;
  memberId?: string; // For DEPOSIT/WITHDRAWAL
  asset?: string; // For BUY/SELL/DIVIDEND
  quantity?: number; // For BUY/SELL
  price?: number; // For BUY/SELL
  amount: number; // For all types
}

export interface Holding {
  asset: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss: number;
  portfolio: PortfolioType;
}

export interface PerformanceDataPoint {
    date: string;
    nav: number;
    shareValue: number;
    /** The value of a market benchmark (e.g., S&P 500 index) on the same date for comparison. */
    benchmark: number;
}

export interface PortfolioState {
    holdings: Holding[];
    cash: number;
    totalValue: number;
}

export interface ClubData {
    members: Member[];
    transactions: Transaction[];
    portfolios: {
        [PortfolioType.PHRONESIS]: PortfolioState;
        [PortfolioType.FLAGSHIP]: PortfolioState;
    };
    // Aggregated values
    cash: number;
    holdings: Holding[];
    totalShares: number;
    totalValue: number;
    shareValue: number;
    performanceHistory: PerformanceDataPoint[];
}

export interface AssetDetails {
  ticker: string;
  sector: string;
  geography: string;
  assetType: string;
}