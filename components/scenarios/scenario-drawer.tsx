'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatProcessTime } from '@/lib/utils';
import { X, User, Bot, Clock, Mail, Archive, Star } from 'lucide-react';
import { Chat, Conversation } from '@/lib/supabaseServer';

interface ScenarioDrawerProps {
  scenarioId: number | null;
  onClose: () => void;
}

interface ScenarioData {
  chat: Chat;
  conversations: Conversation[];
}

export function ScenarioDrawer({ scenarioId, onClose }: ScenarioDrawerProps) {
  const [data, setData] = useState<ScenarioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!scenarioId) {
      setData(null);
      return;
    }

    const fetchScenario = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/scenario/${scenarioId}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch scenario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenario();
  }, [scenarioId]);

  if (!scenarioId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scenario Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading scenario...</p>
            </div>
          ) : data ? (
            <div className="p-6 space-y-6">
              {/* Chat Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{data.chat.title}</span>
                    <div className="flex items-center space-x-2">
                      {data.chat.archive && (
                        <Badge variant="secondary">
                          <Archive className="w-3 h-3 mr-1" />
                          Archived
                        </Badge>
                      )}
                      {data.chat.feedback > 0 && (
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {data.chat.feedback}/5
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{data.chat.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{formatProcessTime(data.chat.processTime)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(data.chat.created_at)}</p>
                  </div>

                  {data.chat.scenario && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Scenario</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {data.chat.scenario}
                      </p>
                    </div>
                  )}

                  {data.chat.model && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Model</p>
                      <Badge variant="outline">{data.chat.model}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversation Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversation (Last 10 Messages)</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.conversations.length > 0 ? (
                    <div className="space-y-4">
                      {data.conversations.map((message, index) => (
                        <div key={message.id} className="flex space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 capitalize">
                                {message.type}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No conversation messages found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Failed to load scenario details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}