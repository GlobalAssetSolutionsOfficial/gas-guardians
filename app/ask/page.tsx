'use client';

import { useState } from 'react';

interface GuardianResponse {
  question: string;
  guardian: string;
  answer: string;
  timestamp: string;
}

const GUARDIANS = [
  { name: 'Dex', emoji: '🤖', domain: 'DEX & Trading' },
  { name: 'Ledger', emoji: '🧠', domain: 'Finance' },
  { name: 'Cipher', emoji: '🥷', domain: 'Security' },
  { name: 'Aegis', emoji: '🛡️', domain: 'Risk' },
  { name: 'Nova', emoji: '⚡', domain: 'Marketing' },
  { name: 'Mint', emoji: '🏃', domain: 'Tokenomics' },
  { name: 'Hash', emoji: '💪', domain: 'Blockchain' },
  { name: 'Node', emoji: '🔧', domain: 'Infrastructure' },
  { name: 'Vault', emoji: '🔐', domain: 'Custody' },
  { name: 'Glitch', emoji: '🐛', domain: 'Testing' },
];

export default function AskGuardian() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<GuardianResponse | null>(null);
  const [history, setHistory] = useState<GuardianResponse[]>([]);

  const handleAsk = async () => {
    if (!question.trim()) {
      alert('Please ask a question');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setResponse(data);
      setHistory([data, ...history]);
      setQuestion('');
    } catch (err) {
      alert('Error asking Guardian');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardian = response ? GUARDIANS.find((g) => g.name === response.guardian) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ask a Guardian</h1>
          <p className="text-slate-400">Get crypto wisdom from the GAS Guardians</p>
        </div>

        {/* Question Input */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about crypto, trading, security, tokenomics..."
            rows={4}
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white placeholder-slate-500 text-sm mb-4"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full bg-teal-500 text-black px-4 py-3 rounded font-semibold hover:bg-teal-600 disabled:opacity-50"
          >
            {loading ? 'Asking Guardian...' : 'Ask Guardian'}
          </button>
        </div>

        {/* Current Response */}
        {response && guardian && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{guardian.emoji}</span>
              <div>
                <p className="text-white font-semibold text-lg">{guardian.name}</p>
                <p className="text-slate-400 text-sm">{guardian.domain}</p>
              </div>
            </div>
            <p className="text-slate-300 mb-4">{response.answer}</p>
            <p className="text-slate-500 text-xs">
              {new Date(response.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Questions</h2>
            <div className="space-y-4">
              {history.map((item, idx) => {
                const g = GUARDIANS.find((g) => g.name === item.guardian);
                return (
                  <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-300 text-sm mb-2">{item.question}</p>
                    <div className="flex items-center gap-2">
                      <span>{g?.emoji}</span>
                      <p className="text-teal-400 text-sm font-semibold">{item.guardian}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
