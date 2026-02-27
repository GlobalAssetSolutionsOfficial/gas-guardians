'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

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

const GUARDIANS = [
  { name: 'Dex', role: 'Captain', emoji: '🤖' },
  { name: 'Ledger', role: 'Brain', emoji: '🧠' },
  { name: 'Cipher', role: 'Ninja', emoji: '🥷' },
  { name: 'Aegis', role: 'Tank', emoji: '🛡️' },
  { name: 'Nova', role: 'Blaster', emoji: '⚡' },
  { name: 'Mint', role: 'Speedster', emoji: '🏃' },
  { name: 'Hash', role: 'Brawler', emoji: '💪' },
  { name: 'Node', role: 'Builder', emoji: '🔧' },
  { name: 'Vault', role: 'Keeper', emoji: '🔐' },
  { name: 'Glitch', role: 'Wildcard', emoji: '🐛' },
];

export default function ProposalDetail() {
  const params = useParams();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingGuardian, setVotingGuardian] = useState<string | null>(null);
  const [voteData, setVoteData] = useState({ vote: 'approve', reasoning: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProposal = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      const data = await res.json();
      setProposal(data);
    } catch (err) {
      console.error('Failed to fetch proposal:', err);
      setProposal(null);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const handleVoteSubmit = async (guardianName: string) => {
    if (!voteData.reasoning.trim()) {
      alert('Please provide reasoning for your vote.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          guardianName,
          vote: voteData.vote,
          reasoning: voteData.reasoning,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit vote');

      setVotingGuardian(null);
      setVoteData({ vote: 'approve', reasoning: '' });
      fetchProposal();
    } catch (err) {
      console.error(err);
      alert('Error submitting vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!proposal) return <div className="p-8 text-white">Proposal not found</div>;

  const votes = proposal.votes ?? [];
  const approveCount = votes.filter((v) => v.vote === 'approve').length;
  const rejectCount = votes.filter((v) => v.vote === 'reject').length;
  const pendingCount = 10 - votes.length;
  const isApproved = approveCount >= proposal.thresholdRequired;

  const status = (proposal.status || 'pending').toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm font-semibold mb-4 inline-block">
          ← Back to Council
        </Link>

        {/* Proposal Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{proposal.title}</h1>
              <p className="text-slate-400">{proposal.description}</p>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                status === 'approved'
                  ? 'bg-green-500/20 text-green-400'
                  : status === 'rejected'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <span className="text-slate-500 text-sm">Type</span>
              <p className="text-white font-semibold">{proposal.type}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Amount</span>
              <p className="text-white font-semibold">${proposal.amount ?? 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Created</span>
              <p className="text-white font-semibold">{new Date(proposal.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Deadline</span>
              <p className="text-white font-semibold">{new Date(proposal.deadline).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Vote Progress */}
          <div className="bg-slate-900 rounded p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400">Guardian Vote Progress</span>
              <span className="text-white font-semibold">
                {approveCount}-of-{proposal.thresholdRequired} required
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden mb-4">
              <div
                className={`h-full transition-all ${isApproved ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min(100, (approveCount / proposal.thresholdRequired) * 100)}%` }}
              />
            </div>
            <div className="flex gap-6 text-sm">
              <span className="text-green-400">✅ {approveCount} Approve</span>
              <span className="text-red-400">❌ {rejectCount} Reject</span>
              <span className="text-slate-400">⏳ {pendingCount} Pending</span>
            </div>
          </div>
        </div>

        {/* Guardian Vote Interface */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-white mb-4">Guardian Votes</h2>

          {GUARDIANS.map((guardian) => {
            const guardianVote = votes.find((v) => v.guardianName === guardian.name);
            const isVoting = votingGuardian === guardian.name;

            return (
              <div key={guardian.name} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{guardian.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{guardian.name}</p>
                      <p className="text-slate-400 text-sm">{guardian.role}</p>
                    </div>
                  </div>

                  {guardianVote ? (
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        guardianVote.vote === 'approve'
                          ? 'bg-green-500/20 text-green-400'
                          : guardianVote.vote === 'reject'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {guardianVote.vote.toUpperCase()}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded text-xs font-semibold bg-slate-700 text-slate-400">
                      PENDING
                    </span>
                  )}
                </div>

                {guardianVote ? (
                  <p className="text-slate-400 text-sm">{guardianVote.reasoning}</p>
                ) : isVoting ? (
                  <div className="space-y-3">
                    <select
                      value={voteData.vote}
                      onChange={(e) => setVoteData({ ...voteData, vote: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                      <option value="needs_info">Needs Info</option>
                    </select>

                    <textarea
                      value={voteData.reasoning}
                      onChange={(e) => setVoteData({ ...voteData, reasoning: e.target.value })}
                      placeholder="Provide your reasoning..."
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-500"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVoteSubmit(guardian.name)}
                        disabled={submitting}
                        className="flex-1 bg-teal-500 text-black px-3 py-2 rounded font-semibold text-sm hover:bg-teal-600 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Submit Vote'}
                      </button>

                      <button
                        onClick={() => setVotingGuardian(null)}
                        className="flex-1 bg-slate-700 text-white px-3 py-2 rounded font-semibold text-sm hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setVotingGuardian(guardian.name)}
                    className="text-teal-400 hover:text-teal-300 text-sm font-semibold"
                  >
                    Vote as {guardian.name} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
