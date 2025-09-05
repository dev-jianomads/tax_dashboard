'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FilterBar } from '@/components/filters/filter-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDefaultDateRange, formatDate } from '@/lib/utils';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface FeedbackItem {
  id: number;
  created_at: string;
  title: string;
  email: string;
  feedback: number;
  comment_sele: string;
  comment_add: string;
}

export default function FeedbackPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Fetch feedback when filters change
  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.email) params.set('email', filters.email);
        if (filters.from) params.set('from', filters.from);
        if (filters.to) params.set('to', filters.to);

        const response = await fetch(`/api/feedback?${params}`);
        if (response.ok) {
          const data = await response.json();
          setFeedbackData(data);
        }
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [filters]);

  const getFeedbackIcon = (feedback: number) => {
    if (feedback === 1) return <ThumbsUp className="w-4 h-4 text-green-600" />;
    if (feedback === -1) return <ThumbsDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getFeedbackBadge = (feedback: number) => {
    if (feedback === 1) return <Badge className="bg-green-100 text-green-800">Positive (+1)</Badge>;
    if (feedback === -1) return <Badge className="bg-red-100 text-red-800">Negative (-1)</Badge>;
    return <Badge variant="secondary">Neutral (0)</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Feedback Details</h1>
          <p className="text-gray-600">Detailed view of all user feedback</p>
        </div>

        <FilterBar 
          emails={emails} 
          onFiltersChange={setFilters}
          initialFilters={filters}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>All Feedback ({feedbackData.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : feedbackData.length > 0 ? (
              <div className="space-y-6">
                {feedbackData.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.title || 'Untitled Scenario'}
                          </h3>
                          {getFeedbackBadge(item.feedback)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>ID: {item.id}</span>
                          <span>Email: {item.email}</span>
                          <span>Date: {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getFeedbackIcon(item.feedback)}
                      </div>
                    </div>

                    {(item.comment_sele || item.comment_add) && (
                      <div className="space-y-3">
                        {item.comment_sele && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Selected Comment:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {item.comment_sele}
                            </p>
                          </div>
                        )}
                        {item.comment_add && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Additional Comment:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {item.comment_add}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {!item.comment_sele && !item.comment_add && (
                      <p className="text-sm text-gray-500 italic">No comments provided</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Found</h3>
                <p className="text-gray-600">No feedback entries match the selected filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}