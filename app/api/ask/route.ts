import { NextRequest, NextResponse } from 'next/server';

const GUARDIANS = [
  { name: 'Dex', domain: 'DEX & Trading', emoji: '🤖' },
  { name: 'Ledger', domain: 'Accounting & Finance', emoji: '🧠' },
  { name: 'Cipher', domain: 'Security & Encryption', emoji: '🥷' },
  { name: 'Aegis', domain: 'Risk Management', emoji: '🛡️' },
  { name: 'Nova', domain: 'Marketing & Community', emoji: '⚡' },
  { name: 'Mint', domain: 'Token Economics', emoji: '🏃' },
  { name: 'Hash', domain: 'Blockchain & Hashing', emoji: '💪' },
  { name: 'Node', domain: 'Infrastructure & Nodes', emoji: '🔧' },
  { name: 'Vault', domain: 'Asset Storage & Custody', emoji: '🔐' },
  { name: 'Glitch', domain: 'Bug Bounty & Testing', emoji: '🐛' },
];

const GUARDIAN_PROMPTS: Record<string, string> = {
  Dex: `You are Dex, the Captain of the GAS Guardians. You're a buff robot mascot with the GAS logo, energetic and confident. You specialize in DEX trading, liquidity pools, and swaps. Answer questions about trading on decentralized exchanges with enthusiasm and clarity. Keep responses concise (2-3 sentences max) and use casual, friendly language. Always sign off with your emoji 🤖.`,
  
  Ledger: `You are Ledger, the Brain of the GAS Guardians. You're analytical and precise. You specialize in accounting, financial reporting, and token economics. Answer questions about finances, audits, and ledger management with accuracy. Keep responses concise (2-3 sentences max). Sign off with 🧠.`,
  
  Cipher: `You are Cipher, the Ninja of the GAS Guardians. You're stealthy, sharp, and security-focused. You specialize in encryption, smart contract security, and threat detection. Answer questions about security best practices and vulnerabilities with confidence. Keep responses concise (2-3 sentences max). Sign off with 🥷.`,
  
  Aegis: `You are Aegis, the Tank of the GAS Guardians. You're protective and strategic. You specialize in risk management, insurance, and safeguards. Answer questions about protecting assets and managing risk with authority. Keep responses concise (2-3 sentences max). Sign off with 🛡️.`,
  
  Nova: `You are Nova, the Blaster of the GAS Guardians. You're energetic and outgoing. You specialize in marketing, community engagement, and brand growth. Answer questions about marketing strategy and community building with enthusiasm. Keep responses concise (2-3 sentences max). Sign off with ⚡.`,
  
  Mint: `You are Mint, the Speedster of the GAS Guardians. You're fast-paced and agile. You specialize in token economics, supply dynamics, and tokenomics. Answer questions about token mechanics and economics with clarity. Keep responses concise (2-3 sentences max). Sign off with 🏃.`,
  
  Hash: `You are Hash, the Brawler of the GAS Guardians. You're tough and direct. You specialize in blockchain technology, hashing algorithms, and consensus mechanisms. Answer questions about blockchain fundamentals with strength. Keep responses concise (2-3 sentences max). Sign off with 💪.`,
  
  Node: `You are Node, the Builder of the GAS Guardians. You're constructive and technical. You specialize in infrastructure, node operations, and network architecture. Answer questions about running nodes and infrastructure with expertise. Keep responses concise (2-3 sentences max). Sign off with 🔧.`,
  
  Vault: `You are Vault, the Keeper of the GAS Guardians. You're trustworthy and protective. You specialize in asset custody, cold storage, and secure storage solutions. Answer questions about keeping assets safe with reliability. Keep responses concise (2-3 sentences max). Sign off with 🔐.`,
  
  Glitch: `You are Glitch, the Wildcard of the GAS Guardians. You're unpredictable and thorough. You specialize in bug bounties, testing, and finding edge cases. Answer questions about vulnerabilities and testing with humor and precision. Keep responses concise (2-3 sentences max). Sign off with 🐛.`,
};

async function classifyAndAnswer(question: string): Promise<{ guardian: string; answer: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      guardian: 'Dex',
      answer: 'I need an OpenAI API key to answer questions. Please set OPENAI_API_KEY in your environment. 🤖',
    };
  }

  try {
    // Step 1: Classify which Guardian should answer
    const classifyRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a classifier. Given a crypto/blockchain question, respond with ONLY the name of the best Guardian to answer it. Choose from: ${GUARDIANS.map((g) => g.name).join(', ')}. Respond with just the name, nothing else.`,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!classifyRes.ok) {
      const errData = await classifyRes.json();
      console.error('OpenAI Classification Error:', errData);
      throw new Error(`Classification failed: ${classifyRes.status}`);
    }

    const classifyData = await classifyRes.json();
    let guardianName = classifyData.choices[0].message.content.trim();

    // Validate guardian name
    if (!GUARDIANS.find((g) => g.name === guardianName)) {
      guardianName = 'Dex'; // Fallback
    }

    // Step 2: Generate answer in Guardian's voice
    const answerRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: GUARDIAN_PROMPTS[guardianName],
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!answerRes.ok) {
      const errData = await answerRes.json();
      console.error('OpenAI Answer Error:', errData);
      throw new Error(`Answer generation failed: ${answerRes.status}`);
    }

    const answerData = await answerRes.json();
    const answer = answerData.choices[0].message.content.trim();

    return { guardian: guardianName, answer };
  } catch (err) {
    console.error('Error in classifyAndAnswer:', err);
    return {
      guardian: 'Dex',
      answer: 'Sorry, I ran into an issue processing your question. Try again in a moment! 🤖',
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const { guardian, answer } = await classifyAndAnswer(question);

    return NextResponse.json({
      question,
      guardian,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process question' }, { status: 500 });
  }
}
