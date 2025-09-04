'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatProcessTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { ScenarioDrawer } from './scenario-drawer';

interface Scenario {
  id: number;
  created_at: string;
  title: string;
  email: string;
  processTime: number;
  model: string;
  archive: boolean;
  feedback: number;
}

interface ScenariosTableProps {
  filters: {
    email?: string;
    from?: string;
    to?: string;
  };
}

export function ScenariosTable({ filters }: ScenariosTableProps) {
  const [data, setData] = useState<{
    data: Scenario[];
    count: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  const fetchScenarios = async (page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '25',
        ...filters,
      });

      const response = await fetch(`/api/scenarios?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchScenarios(1);
  }, [filters.email, filters.from, filters.to]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchScenarios(page);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Process Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Model</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((scenario) => (
                      <tr 
                        key={scenario.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedScenario(scenario.id)}
                      >
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(scenario.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {scenario.title || 'Untitled'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {scenario.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatProcessTime(scenario.processTime)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">{scenario.model || 'N/A'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center space-x-2">
                            {scenario.archive && (
                              <Badge variant="secondary">Archived</Badge>
                            )}
                            {scenario.feedback > 0 && (
                              <Badge variant="outline">★ {scenario.feedback}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScenario(scenario.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * 25) + 1} to {Math.min(currentPage * 25, data.count)} of {data.count} scenarios
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === data.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No scenarios found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ScenarioDrawer
        scenarioId={selectedScenario}
        onClose={() => setSelectedScenario(null)}
      />
    </>
  );
}