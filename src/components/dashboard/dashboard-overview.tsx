'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Wallet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample data - in production, this would come from API
const mockProjects = [
  {
    id: 'aa9ef18d-1644-4af4-b1e8-f5f1d95eccf3',
    name: 'Cortex Mind',
    invested: 2500,
    currentValue: null, // Still in funding phase, no current value yet
    roi: null, // No ROI until funded and listed
    progress: 65, // Still in funding phase
    status: 'funding',
    expected_completion: '2025-05-15'
  },
  {
    id: '1b4115dc-7280-4b90-8c23-0034fb05fdf1',
    name: 'AI Fusion',
    invested: 5000,
    currentValue: 15650,
    roi: 213,
    progress: 100, // Fully funded and launched
    status: 'active',
    launch_date: '2025-03-10'
  },
  {
    id: 'f10c5123-0f73-48c6-be9d-ca2478051916',
    name: 'Neural Bridge',
    invested: 1200,
    currentValue: 16164,
    roi: 1247,
    progress: 100, // Fully funded and launched
    status: 'active',
    launch_date: '2025-02-28'
  }
];

interface DashboardOverviewProps {
  user: {
    id: string;
    wallet_address: string;
    tier: number;
    ofund_balance: number;
    display_name?: string;
  } | null;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  // Calculate total portfolio value
  const totalInvested = mockProjects.reduce((sum, project) => sum + project.invested, 0);
  const totalValue = mockProjects.reduce((sum, project) => sum + (project.currentValue || 0), 0);
  const totalROI = totalValue > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, {user?.display_name || user?.wallet_address?.slice(0, 6) + '...' + user?.wallet_address?.slice(-4)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <h3 className="mt-1 text-2xl font-bold">${totalInvested.toLocaleString()}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="flex items-center text-sm font-medium text-green-600">
              <TrendingUp size={16} className="mr-1" />
              {totalROI.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500">from initial investment</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
              <h3 className="mt-1 text-2xl font-bold">${totalValue.toLocaleString()}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className={`flex items-center text-sm font-medium ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} className="mr-1" />
              ${(totalValue - totalInvested).toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">total profit/loss</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Your Tier Level</p>
              <h3 className="mt-1 text-2xl font-bold">Tier {user?.tier || 0}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="flex items-center text-sm font-medium text-primary">
              {user?.ofund_balance?.toLocaleString() || 0} $OFUND
            </span>
            <span className="text-sm text-gray-500">token balance</span>
          </div>
        </div>
      </div>

      {/* Recent Investments */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Investments</h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Invested
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Current Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ROI
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Progress
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mockProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    ${project.invested.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {project.currentValue ? `$${project.currentValue.toLocaleString()}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {project.roi !== null ? (
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        project.roi > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {project.roi > 0 ? '+' : ''}{project.roi}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="w-full rounded-full bg-gray-200">
                      <div 
                        className="h-2 rounded-full bg-primary" 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    {project.progress === 100 ? (
                      <span className="mt-1 text-xs text-green-600">Launched {project.launch_date}</span>
                    ) : (
                      <span className="mt-1 text-xs text-gray-500">{project.progress}% Funded</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/project/${project.id}`} className="text-primary hover:text-primary/80">
                      View Project
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
