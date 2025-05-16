import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Get all reports with form information
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        form: {
          select: {
            name: true
          }
        }
      }
    });

    // Format the response to include form name
    const formattedReports = reports.map(report => ({
      id: report.id,
      name: report.name,
      formId: report.formId,
      reportUrl: report.reportUrl,
      createdAt: report.createdAt,
      formName: report.form?.name
    }));

    return NextResponse.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}