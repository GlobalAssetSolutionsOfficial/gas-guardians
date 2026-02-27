-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL,
    "linksJson" TEXT NOT NULL DEFAULT '[]',
    "createdBy" TEXT NOT NULL DEFAULT 'Brandon',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "thresholdRequired" INTEGER NOT NULL,
    "autoRouted" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" DATETIME,
    "multisigTxHash" TEXT
);

-- CreateTable
CREATE TABLE "GuardianVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuardianVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProposalQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "askedBy" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "askedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" DATETIME,
    CONSTRAINT "ProposalQuestion_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GuardianVote_proposalId_guardianName_key" ON "GuardianVote"("proposalId", "guardianName");
