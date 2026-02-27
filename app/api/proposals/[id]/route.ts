import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: { votes: true, questions: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...proposal,
      status: proposal.status ?? 'pending',
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch proposal' }, { status: 500 });
  }
}
