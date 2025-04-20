'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

// Mock user for demo purposes
const mockUser = {
  id: '1',
  wallet_address: '5KRwas7CH43JYXFrW6VHEhfBPztYQk5U5XvWK3N2VKhKutQY',
  tier: 2,
  ofund_balance: 12500,
  display_name: undefined, // Set to undefined to show wallet address formatting
};

export default function DashboardDemoPage() {
  return (
    <DashboardLayout>
      <DashboardOverview user={mockUser} />
    </DashboardLayout>
  );
}
