import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatProcessTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, User, Bot, Clock, Mail, Archive, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ScenarioPageProps {
  params: { id: string };
}

export default async function ScenarioPage({ params }: ScenarioPageProps) {
  const id = parseInt(params.id);
  
  if (isNaN(id)) {
    notFound();
  }

  const client = supabase();
  
  // Fetch chat details
  const { data: chat, error: chatError } = await client
    .from('chat')
    .select('*')
    .eq('id', id)
    .single();

  if (chatError || !chat) {
    notFound();
  }

  // Fetch last 10 conversation messages (DESC order)
  const { data: conversations, error: convError } = await client
    .from('conversation')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  const conversationMessages = conversations || [];

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Scenario Details</h1>
          <p className="text-gray-600">Detailed view of scenario #{id}</p>
        </div>

        <div className="space-y-6">
          {/* Chat Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{chat.title || 'Untitled Scenario'}</span>
                <div className="flex items-center space-x-2">
                  {chat.archive && (
                    <Badge variant="secondary">
                      <Archive className="w-3 h-3 mr-1" />
                      Archived
                    </Badge>
                  )}
                  {chat.feedback > 0 && (
                    <Badge variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {chat.feedback}/5
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{chat.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{formatProcessTime(chat.processTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created: </span>
                  <span className="text-gray-700">{formatDate(chat.created_at)}</span>
                </div>
                {chat.updated_on && (
                  <div>
                    <span className="text-gray-500">Updated: </span>
                    <span className="text-gray-700">{formatDate(chat.updated_on)}</span>
                  </div>
                )}
              </div>

              {chat.scenario && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Scenario Description</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {chat.scenario}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chat.model && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Model</h3>
                    <Badge variant="outline">{chat.model}</Badge>
                  </div>
                )}

                {chat.citationsURL && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Citations URL</h3>
                    <a 
                      href={chat.citationsURL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>View Citations</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {chat.research && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Research</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    {chat.research}
                  </div>
                </div>
              )}

              {chat.draft && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Draft</h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    {chat.draft}
                  </div>
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
              {conversationMessages.length > 0 ? (
                <div className="space-y-6">
                  {conversationMessages.map((message) => (
                    <div key={message.id} className="flex space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {message.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversation messages found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}