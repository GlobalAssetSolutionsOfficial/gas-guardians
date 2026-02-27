'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PROPOSAL_TYPES = {
  treasury_spend: {
    label: 'Treasury Spend',
    subcategories: ['small', 'medium', 'large'],
  },
  contract_change: {
    label: 'Contract Change',
    subcategories: ['minor', 'major'],
  },
  marketing: {
    label: 'Marketing/Community',
    subcategories: ['small', 'large'],
  },
  emergency: {
    label: 'Emergency Action',
    subcategories: ['emergency'],
  },
  governance: {
    label: 'Governance/Structural',
    subcategories: ['governance'],
  },
};

export default function CreateProposal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'treasury_spend',
    subcategory: 'small',
    description: '',
    amount: '',
    links: '',
    deadline: '',
    autoRouted: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    const firstSubcategory = PROPOSAL_TYPES[newType as keyof typeof PROPOSAL_TYPES].subcategories[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      subcategory: firstSubcategory,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const linksArray = formData.links
        .split('\n')
        .map((link) => link.trim())
        .filter((link) => link.length > 0);

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          subcategory: formData.subcategory,
          description: formData.description,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          links: linksArray,
          deadline: new Date(formData.deadline).toISOString(),
          autoRouted: formData.autoRouted,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create proposal');
      }

      const proposal = await res.json();
      router.push(`/proposals/${proposal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentType = PROPOSAL_TYPES[formData.type as keyof typeof PROPOSAL_TYPES];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-teal-400 hover:text-teal-300 text-sm font-semibold mb-4 inline-block">
            ← Back to Council
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Create Proposal</h1>
          <p className="text-slate-400">Submit a new proposal for Guardian review</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Marketing budget for Q1"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-white font-semibold mb-2">Proposal Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {Object.entries(PROPOSAL_TYPES).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-white font-semibold mb-2">Subcategory *</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {currentType.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Detailed description of the proposal..."
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g., 5000"
              step="0.01"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-white font-semibold mb-2">Links (one per line)</label>
            <textarea
              name="links"
              value={formData.links}
              onChange={handleChange}
              placeholder="https://example.com&#10;https://another.com"
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-white font-semibold mb-2">Deadline *</label>
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Auto-route */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="autoRouted"
              checked={formData.autoRouted}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <label className="ml-3 text-slate-300">Auto-route Guardians by proposal type</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}
