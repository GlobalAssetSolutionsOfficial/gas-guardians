'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface GuardianVote {
  id: string;
  guardianName: string;
  vote: string;
  reasoning: string;
  votedAt: string;
}

interface Proposal {
  id: string;
  title: string;
  type: string;
  subcategory: string;
  description: string;
  amount: number | null;
  createdAt: string;
  deadline: string;
  status?: string | null;
  thresholdRequired: number;
  votes: GuardianVote[];
}

export default function Home() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await fetch('/api/proposals');
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading proposals...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">GAS Guardians Council</h1>
          <p className="text-slate-400">Decentralized governance powered by AI</p>

          <Link
            href="/ask"
            className="text-teal-400 hover:text-teal-300 text-sm font-semibold inline-block mt-3"
          >
            Ask a Guardian →
          </Link>
        </div>

        {/* Create Proposal Button */}
        <div className="mb-8">
          <Link
            href="/proposals/create"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition inline-block"
          >
            + Create Proposal
          </Link>
        </div>

        {/* Proposals Grid */}
        <div className="grid gap-6">
          {proposals.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No proposals yet. Create one to get started.</div>
          ) : (
            proposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const votes = proposal.votes ?? [];
  const approveCount = votes.filter((v) => v.vote === 'approve').length;
  const rejectCount = votes.filter((v) => v.vote === 'reject').length;
  const pendingCount = 10 - votes.length;
  const isApproved = approveCount >= proposal.thresholdRequired;

  const status = (proposal.status || 'pending').toLowerCase();

  const statusColor =
    status === 'approved'
      ? 'bg-green-500/20 text-green-400'
      : status === 'rejected'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-yellow-500/20 text-yellow-400';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{proposal.title}</h2>
          <p className="text-slate-400 text-sm mt-1">{proposal.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
        <div>
          <span className="text-slate-500">Type</span>
          <p className="text-white font-semibold">{proposal.type}</p>
        </div>
        <div>
          <span className="text-slate-500">Amount</span>
          <p className="text-white font-semibold">${proposal.amount ?? 'N/A'}</p>
        </div>
        <div>
          <span className="text-slate-500">Deadline</span>
          <p className="text-white font-semibold">{new Date(proposal.deadline).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-slate-500">Threshold</span>
          <p className="text-white font-semibold">{proposal.thresholdRequired}-of-10</p>
        </div>
      </div>

      {/* Vote Tally */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Guardian Votes</span>
          <span className="text-white font-semibold">
            {approveCount}-of-{proposal.thresholdRequired} required
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${isApproved ? 'bg-green-500' : 'bg-yellow-500'}`}
            style={{ width: `${Math.min(100, (approveCount / proposal.thresholdRequired) * 100)}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-green-400">✅ {approveCount} Approve</span>
          <span className="text-red-400">❌ {rejectCount} Reject</span>
          <span className="text-slate-400">⏳ {pendingCount} Pending</span>
        </div>
      </div>

      {/* Guardian Votes (Expandable) */}
      <details className="text-sm">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
          View Guardian Votes ({votes.length}/10)
        </summary>
        <div className="mt-4 space-y-3 bg-slate-900 p-4 rounded border border-slate-700">
          {votes.length === 0 ? (
            <p className="text-slate-500">No votes yet.</p>
          ) : (
            votes.map((vote) => (
              <div key={vote.id} className="border-l-2 border-slate-600 pl-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{vote.guardianName}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      vote.vote === 'approve'
                        ? 'bg-green-500/20 text-green-400'
                        : vote.vote === 'reject'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {vote.vote.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{vote.reasoning}</p>
              </div>
            ))
          )}
        </div>
      </details>

      {/* Action */}
      <div className="mt-6">
        <Link href={`/proposals/${proposal.id}`} className="text-teal-400 hover:text-teal-300 text-sm font-semibold">
          View Details →
        </Link>
      </div>
    </div>
  );
}
