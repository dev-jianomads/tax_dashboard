import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { filtersSchema } from '@/lib/validations';
import { formatDate, formatProcessTime } from '@/lib/utils';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { getMockMetrics } from '@/lib/mockData';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#374151',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#4b5563',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
  },
  tableCell: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8,
    fontSize: 10,
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    width: '23%',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
});

interface PDFReportProps {
  filters: any;
  metrics: any;
  latestScenarios: any[];
}

const PDFReport = ({ filters, metrics, latestScenarios }: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Praxio AI Dashboard Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter Summary</Text>
        <Text style={styles.text}>Email: {filters.email || 'All users'}</Text>
        <Text style={styles.text}>Date Range: {filters.from || 'N/A'} to {filters.to || 'N/A'}</Text>
        <Text style={styles.text}>Generated: {formatDate(new Date())}</Text>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{metrics.scenariosCount}</Text>
          <Text style={styles.kpiLabel}>Total Scenarios</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{formatProcessTime(metrics.totalProcessTime)}</Text>
          <Text style={styles.kpiLabel}>Total Processing Time</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{formatProcessTime(metrics.avgProcessTime)}</Text>
          <Text style={styles.kpiLabel}>Avg Processing Time</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{metrics.engagement.toFixed(1)}</Text>
          <Text style={styles.kpiLabel}>Engagement Rate</Text>
        </View>
      </View>

      {latestScenarios.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest 5 Scenarios</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>ID</Text>
              <Text style={styles.tableHeader}>Created</Text>
              <Text style={styles.tableHeader}>Title</Text>
              <Text style={styles.tableHeader}>Email</Text>
            </View>
            {latestScenarios.map((scenario) => (
              <View style={styles.tableRow} key={scenario.id}>
                <Text style={styles.tableCell}>{scenario.id}</Text>
                <Text style={styles.tableCell}>{formatDate(scenario.created_at)}</Text>
                <Text style={styles.tableCell}>{scenario.title || 'Untitled'}</Text>
                <Text style={styles.tableCell}>{scenario.email}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = filtersSchema.parse(body);

    try {
      // Try to use Supabase first
      const client = supabase();
      
      // Fetch metrics for the report
      let query = client.from('chat').select('*');
      
      if (filters.email) {
        query = query.eq('email', filters.email);
      }
      
      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }
      
      if (filters.to) {
        query = query.lte('created_at', filters.to + 'T23:59:59.999Z');
      }

      const { data: chats, error } = await query;

      if (error) {
        console.warn('Supabase query error, falling back to mock data:', error);
        const metrics = getMockMetrics(filters);
        const pdfDoc = <PDFReport filters={filters} metrics={metrics} latestScenarios={metrics.latestFive} />;
        const pdfBuffer = await pdf(pdfDoc).toBuffer();

        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="praxio-ai-report-${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        });
      }

      // Calculate metrics
      const scenariosCount = chats.length;
      const latestFive = chats
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      const totalProcessTime = chats.reduce((sum, chat) => sum + (chat.processTime || 0), 0);
      const avgProcessTime = scenariosCount > 0 ? totalProcessTime / scenariosCount : 0;

      // Calculate engagement
      let engagement = 0;
      if (scenariosCount > 0) {
        const chatIds = chats.map(chat => chat.id);
        const { count: conversationCount, error: convError } = await client
          .from('conversation')
          .select('*', { count: 'exact', head: true })
          .in('chat_id', chatIds);

        if (!convError && conversationCount !== null) {
          engagement = conversationCount / scenariosCount;
        }
      }

      const metrics = {
        scenariosCount,
        totalProcessTime,
        avgProcessTime,
        engagement,
      };

      // Generate PDF
      const pdfDoc = <PDFReport filters={filters} metrics={metrics} latestScenarios={latestFive} />;
      const pdfBuffer = await pdf(pdfDoc).toBuffer();

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="praxio-ai-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } catch (supabaseError) {
      console.warn('Supabase not available, using mock data:', supabaseError);
      // Fall back to mock data when Supabase is not available
      const metrics = getMockMetrics(filters);
      const pdfDoc = <PDFReport filters={filters} metrics={metrics} latestScenarios={metrics.latestFive} />;
      const pdfBuffer = await pdf(pdfDoc).toBuffer();

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="praxio-ai-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}