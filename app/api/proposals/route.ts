import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        votes: true,
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      type,
      subcategory,
      description,
      amount,
      links,
      deadline,
      autoRouted,
    } = body;

    const thresholdMap: Record<string, number> = {
      'marketing_small': 5,
      'marketing_large': 6,
      'treasury_spend_small': 5,
      'treasury_spend_medium': 7,
      'treasury_spend_large': 8,
      'contract_change_minor': 6,
      'contract_change_major': 8,
      'emergency_emergency': 3,
      'governance_governance': 9,
    };

    const key = `${type}_${subcategory}`;
    const thresholdRequired = thresholdMap[key] || 5;

    const proposal = await prisma.proposal.create({
      data: {
        title,
        type,
        subcategory,
        description,
        amount: amount ? parseFloat(amount) : null,
        linksJson: JSON.stringify(links || []),
        deadline: new Date(deadline),
        thresholdRequired,
        autoRouted: autoRouted || false,
      },
      include: {
        votes: true,
        questions: true,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}
