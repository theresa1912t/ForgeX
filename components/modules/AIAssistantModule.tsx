'use client';

import React, { useState } from 'react';
import { useFactory } from '@/lib/factoryStore';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ExternalLink,
  SearchCode,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  links?: Array<{ label: string; module: string; id?: string }>;
}

let messageCounter = 1;
function getNextId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

export function AIAssistantModule() {
  const {
    productionLines,
    machines,
    alerts,
    materialBatches,
    investigations,
    setActiveTab,
    setSelectedInvestigationId,
  } = useFactory();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello Marcus. I am your FactoryLens Operations Intelligence Copilot. I have indexed real-time SCADA throughput, machine sensor vibrations, checkweigher defects, and raw material lots for FreshBite Foods Main Plant.

Ask me any operational question about production loss, machine health, root causes, or financial impact.`,
      timestamp: '10:45 AM',
    },
  ]);

  const presetQuestions = [
    'Why is production below target today?',
    'Which machine is causing the most production loss this week?',
    'What caused the increase in defects on Line 3?',
    'Which issue should we fix first?',
    'How much revenue is currently at risk across the plant?',
    'What changed after Material Batch RM-284 was introduced?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: getNextId('user'),
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          context: {
            facility: 'FreshBite Foods Main Plant',
            lines: productionLines.map((l) => ({ name: l.name, actual: l.currentUnitsPerHour, target: l.targetUnitsPerHour, loss: l.productionLossUnits })),
            machines: machines.map((m) => ({ name: m.name, status: m.status, vibration: m.vibrationMmS, lossContributionPct: m.productionLossContributionPct })),
            activeAlerts: alerts.filter((a) => a.status !== 'Resolved').map((a) => ({ title: a.title, severity: a.severity, impact: a.estimatedImpact })),
            materialBatch: materialBatches.find((b) => b.batchCode === 'RM-284'),
          },
        }),
      });

      const data = await res.json();
      const botText = data.text || 'Operational data synthesis complete.';

      const links: ChatMessage['links'] = [];
      if (q.toLowerCase().includes('line 3') || q.toLowerCase().includes('m-03') || q.toLowerCase().includes('target') || q.toLowerCase().includes('why')) {
        links.push({
          label: 'Open Line 3 Root Cause Investigation #INV-LINE3-HERO',
          module: 'investigations',
          id: 'inv-line3-hero',
        });
      }

      const botMsg: ChatMessage = {
        id: getNextId('assistant'),
        sender: 'assistant',
        text: botText,
        timestamp: 'Just now',
        links,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: getNextId('fallback'),
        sender: 'assistant',
        text: `DIRECT ANSWER:\nLine 3 is currently 14% below target due to valve diaphragm seal resistance on Filling Machine M-03 ($4,650 loss today).\n\nRECOMMENDED ACTION:\nInspect valve heads #4 & #8 on M-03 and replace seal kit during shift break.`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium text-[#5F6875] mb-1">
            Operations Intelligence Advisor
          </div>
          <h1 className="text-[32px] leading-[40px] font-semibold text-[#18202A]">
            AI Assistant
          </h1>
          <p className="text-[15px] leading-[24px] text-[#5F6875] mt-2">
            Ask questions grounded in active plant telemetry, work orders, ingredient batches, and financial run-rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-10 px-3.5 rounded-lg text-[13px] font-medium bg-[#EEF3FF] text-[#2F5BFF] border border-[#D9E4FF] inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Telemetry Context Active</span>
          </span>
        </div>
      </div>

      {/* 2. Suggested Queries */}
      <div className="card-base">
        <span className="text-[13px] font-medium text-[#5F6875] block mb-3">
          Suggested Operational Queries:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="h-10 px-4 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF3FF] hover:text-[#2F5BFF] border border-[#E4E7EB] text-[14px] text-[#18202A] transition-colors text-left font-normal"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation Card */}
      <div className="card-base min-h-[460px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[520px] pr-2">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-4 text-[14px] leading-[24px] ${isBot ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-semibold text-[13px] ${
                    isBot
                      ? 'bg-[#2F5BFF] text-white shadow-sm'
                      : 'bg-[#18202A] text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : 'MV'}
                </div>

                <div
                  className={`p-5 rounded-xl max-w-2xl whitespace-pre-wrap ${
                    isBot
                      ? 'bg-[#F7F8FA] border border-[#E4E7EB] text-[#18202A]'
                      : 'bg-[#2F5BFF] text-white'
                  }`}
                >
                  <div>{m.text}</div>

                  {m.links && m.links.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#E4E7EB] space-y-2">
                      {m.links.map((link, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTab(link.module);
                            if (link.id) setSelectedInvestigationId(link.id);
                          }}
                          className="h-9 px-3 text-[13px] font-medium text-[#2F5BFF] bg-white hover:bg-[#EEF3FF] rounded-lg border border-[#D9E4FF] flex items-center gap-2 transition-colors"
                        >
                          <SearchCode className="w-4 h-4" />
                          <span>{link.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`mt-2 text-[13px] text-right ${isBot ? 'text-[#8A93A0]' : 'text-white/80'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-[14px] text-[#5F6875] pl-12">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2F5BFF]" />
              <span>Analyzing cross-domain sensor historical vectors...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-[#E4E7EB] flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask about production loss, vibration spikes, or root causes..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 h-10 px-4 text-[14px] bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg placeholder-[#8A93A0] text-[#18202A] focus:outline-none focus:border-[#2F5BFF] focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="h-10 px-5 bg-[#2F5BFF] hover:bg-[#2448D8] text-white font-medium text-[14px] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
