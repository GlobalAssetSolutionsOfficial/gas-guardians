-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "linksJson" TEXT NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL DEFAULT 'Brandon',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "thresholdRequired" INTEGER NOT NULL,
    "autoRouted" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" TIMESTAMP(3),
    "multisigTxHash" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianVote" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardianVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalQuestion" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "askedBy" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "askedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "ProposalQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianVote_proposalId_guardianName_key" ON "GuardianVote"("proposalId", "guardianName");

-- AddForeignKey
ALTER TABLE "GuardianVote" ADD CONSTRAINT "GuardianVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalQuestion" ADD CONSTRAINT "ProposalQuestion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
