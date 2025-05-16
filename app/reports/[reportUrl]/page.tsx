'use client';

import { useEffect, useState } from 'react';
import ChartRenderer from '@/components/ChartRenderer';
import axios from 'axios';

export default function PublishedReportPage({ params }: { params: { reportUrl: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // First fetch the report details
        const reportRes = await axios.get(`/api/reports/${params.reportUrl}`);
        setReportData(reportRes.data);

        // Then fetch the actual chart data
        const { formId, config } = reportRes.data;
        const { xKey, yKey, chartType } = JSON.parse(config);

        const dataRes = await axios.post('/api/report-data-new', {
          formId,
          xKey,
          yKey,
          chartType
        });

        setChartData(dataRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.reportUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p>The requested report could not be found.</p>
        </div>
      </div>
    );
  }

  const { name, config } = reportData;
  const { xKey, yKey, chartType } = JSON.parse(config);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{name}</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {chartData.length > 0 ? (
          <ChartRenderer type={chartType} data={chartData} xKey={xKey} yKey={yKey} />
        ) : (
          <p className="text-center text-gray-500 py-12">No data available for this report.</p>
        )}
      </div>
    </div>
  );
}