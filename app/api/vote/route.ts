import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { proposalId, guardianName, vote, reasoning } = body;

    // Create the vote
    const guardianVote = await prisma.guardianVote.create({
      data: {
        proposalId,
        guardianName,
        vote,
        reasoning,
      },
    });

    // Fetch all votes for this proposal
    const allVotes = await prisma.guardianVote.findMany({
      where: { proposalId },
    });

    // Get proposal to check threshold
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Count votes
    const approveCount = allVotes.filter((v) => v.vote === 'approve').length;
    const rejectCount = allVotes.filter((v) => v.vote === 'reject').length;
    const thresholdRequired = proposal.thresholdRequired;

    // Determine new status
    let newStatus = proposal.status;
    if (approveCount >= thresholdRequired) {
      newStatus = 'approved';
    } else if (rejectCount > 10 - thresholdRequired) {
      newStatus = 'rejected';
    }

    // Update proposal status if changed
    if (newStatus !== proposal.status) {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: newStatus },
      });
    }

    return NextResponse.json(guardianVote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
