'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FilterBar } from '@/components/filters/filter-bar';
import { KpiCard } from '@/components/kpi/kpi-card';
import { ScenariosTable } from '@/components/scenarios/scenarios-table';
import { Button } from '@/components/ui/button';
import { getDefaultDateRange } from '@/lib/utils';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Download,
  Mail,
  ThumbsUp,
  Star
} from 'lucide-react';
import Link from 'next/link';

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
  totalFeedback: number;
  avgFeedback: number;
}

export default function AdminPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const defaultRange = getDefaultDateRange();
  const [filters, setFilters] = useState({
    email: '',
    from: defaultRange.from,
    to: defaultRange.to,
  });

  // Fetch emails for filter dropdown
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

  // Fetch metrics when filters change
  useEffect(() => {
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
  }, [filters]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `praxio-ai-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor tax scenarios and user activity across the platform</p>
        </div>

        <FilterBar 
          emails={emails} 
          onFiltersChange={setFilters}
          initialFilters={filters}
        />

        {/* Export Actions */}
        <div className="flex justify-end mb-6 space-x-3">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </Button>
          
          {/* TODO: Email export */}
          <Button
            variant="outline"
            disabled
            className="flex items-center space-x-2 opacity-50"
            title="Email export coming soon"
          >
            <Mail className="w-4 h-4" />
            <span>Email Report</span>
          </Button>
        </div>

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

        {/* Feedback KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/admin/feedback">
            <KpiCard
              title="Total Feedback"
              value={isLoadingMetrics ? '...' : metrics?.totalFeedback || 0}
              icon={ThumbsUp}
              subtitle="Click to view detailed feedback"
            />
          </Link>
          <KpiCard
            title="Average Feedback Score"
            value={isLoadingMetrics ? '...' : metrics ? `${metrics.avgFeedback.toFixed(2)}` : '0.00'}
            icon={Star}
            subtitle="Range: -1 to +1"
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
      </div>
    </DashboardLayout>
  );
}