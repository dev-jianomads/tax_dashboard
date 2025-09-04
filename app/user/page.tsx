'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FilterBar } from '@/components/filters/filter-bar';
import { KpiCard } from '@/components/kpi/kpi-card';
import { ScenariosTable } from '@/components/scenarios/scenarios-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDefaultDateRange } from '@/lib/utils';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp,
  User
} from 'lucide-react';

interface Metrics {
  scenariosCount: number;
  latestFive: Array<{
    id: number;
    created_at: string;
    title: string;
    email: string;
  }>;
  totalProcessTime: number;
  avgProcessTime: number;
  engagement: number;
}

export default function UserPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  
  const defaultRange = getDefaultDateRange();
  const [filters, setFilters] = useState({
    email: '',
    from: defaultRange.from,
    to: defaultRange.to,
  });

  // Fetch emails for dropdown
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/emails');
        if (response.ok) {
          const emailList = await response.json();
          setEmails(emailList);
        }
      } catch (error) {
        console.error('Failed to fetch emails:', error);
      }
    };

    fetchEmails();
  }, []);

  // Update filters when email selection changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, email: selectedEmail === 'all' ? '' : selectedEmail }));
  }, [selectedEmail]);

  // Fetch metrics when filters change (only if email is selected)
  useEffect(() => {
    if (!selectedEmail) {
      setMetrics(null);
      return;
    }

    const fetchMetrics = async () => {
      setIsLoadingMetrics(true);
      try {
        const params = new URLSearchParams();
        if (filters.email) params.set('email', filters.email);
        if (filters.from) params.set('from', filters.from);
        if (filters.to) params.set('to', filters.to);

        const response = await fetch(`/api/metrics?${params}`);
        if (response.ok) {
          const metricsData = await response.json();
          setMetrics(metricsData);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [filters, selectedEmail]);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">User View</h1>
          <p className="text-gray-600">View detailed analytics for a specific user</p>
        </div>

        {/* Email Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select User Email</label>
            <Select value={selectedEmail} onValueChange={setSelectedEmail}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Choose a user email to view their data" />
              </SelectTrigger>
              <SelectContent>
                {emails.map((email) => (
                  <SelectItem key={email} value={email}>
                    {email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedEmail ? (
          <>
            <FilterBar 
              emails={emails} 
              onFiltersChange={setFilters}
              initialFilters={filters}
              showUserSelect={false}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard
                title="Total Scenarios"
                value={isLoadingMetrics ? '...' : metrics?.scenariosCount || 0}
                icon={MessageSquare}
                subtitle="Tax scenarios created"
              />
              <KpiCard
                title="Total Processing Time"
                value={isLoadingMetrics ? '...' : metrics ? `${metrics.totalProcessTime.toFixed(2)}s` : '0s'}
                icon={Clock}
                subtitle="Cumulative processing time"
              />
              <KpiCard
                title="Avg Processing Time"
                value={isLoadingMetrics ? '...' : metrics ? `${metrics.avgProcessTime.toFixed(2)}s` : '0s'}
                icon={Clock}
                subtitle="Per scenario average"
              />
              <KpiCard
                title="Engagement Rate"
                value={isLoadingMetrics ? '...' : metrics ? `${metrics.engagement.toFixed(1)}` : 'No Scenarios'}
                icon={TrendingUp}
                subtitle="Messages per scenario"
              />
            </div>

            {/* Latest 5 Scenarios */}
            {metrics?.latestFive && metrics.latestFive.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Latest 5 Scenarios</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.latestFive.map((scenario) => (
                          <tr key={scenario.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{scenario.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(scenario.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {scenario.title || 'Untitled'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{scenario.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Scenarios Table */}
            <ScenariosTable filters={filters} />
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a User</h3>
            <p className="text-gray-600">Choose a user email from the dropdown above to view their scenarios and analytics</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}