import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/server/gemini';

interface AssistantContext {
  facility?: string;
  lines?: Array<{ name: string; actual: number; target: number; loss: number }>;
  machines?: Array<{ name: string; status: string; vibration?: number; lossContributionPct?: number }>;
  activeAlerts?: Array<{ title: string; severity: string; impact: string }>;
  materialBatch?: { batchCode?: string; status?: string; viscosityDeviationPct?: number | null } | null;
}

// Used only when Gemini is unavailable (no key, quota, network) — built entirely from the real
// `context` the caller already sends (see AIAssistantModule.tsx), never from scripted
// hero-scenario text, so a degraded response still reflects actual current plant state instead
// of a fixed scenario unrelated to what's really happening.
function buildContextualFallback(context: AssistantContext): string {
  const activeAlerts = Array.isArray(context.activeAlerts) ? context.activeAlerts : [];
  const lines = Array.isArray(context.lines) ? context.lines : [];
  const machines = Array.isArray(context.machines) ? context.machines : [];
  const materialBatch = context.materialBatch;

  const out: string[] = [];

  out.push('**DIRECT ANSWER**');
  if (activeAlerts.length === 0) {
    out.push('No active alerts are currently open across the monitored lines.');
  } else {
    const top = activeAlerts[0];
    out.push(
      `${activeAlerts.length} alert${activeAlerts.length > 1 ? 's are' : ' is'} currently open. Highest priority: "${top.title}" (${top.severity}) — ${top.impact}.`,
    );
  }

  out.push('', '**ACTIVE ALERTS**');
  if (activeAlerts.length === 0) {
    out.push('- None currently open.');
  } else {
    for (const a of activeAlerts.slice(0, 5)) {
      out.push(`- [${a.severity}] ${a.title} — ${a.impact}`);
    }
  }

  const belowTarget = lines.filter(
    (l) => typeof l.actual === 'number' && typeof l.target === 'number' && l.actual < l.target,
  );
  if (belowTarget.length > 0) {
    out.push('', '**PRODUCTION LINES BELOW TARGET**');
    for (const l of belowTarget) {
      const deficitPct = Math.round(((l.target - l.actual) / l.target) * 100);
      out.push(`- ${l.name}: ${l.actual}/${l.target} units/hr (-${deficitPct}%), ${l.loss} units lost`);
    }
  }

  const abnormalMachines = machines.filter((m) => m.status && m.status !== 'Normal' && m.status !== 'Running');
  if (abnormalMachines.length > 0) {
    out.push('', '**MACHINES NEEDING ATTENTION**');
    for (const m of abnormalMachines) {
      const bits = [`status ${m.status}`];
      if (typeof m.vibration === 'number') bits.push(`vibration ${m.vibration} mm/s`);
      if (typeof m.lossContributionPct === 'number') bits.push(`${m.lossContributionPct}% of total loss`);
      out.push(`- ${m.name}: ${bits.join(', ')}`);
    }
  }

  if (materialBatch) {
    out.push('', '**MATERIAL BATCH REFERENCED**');
    const bits = [materialBatch.status].filter(Boolean);
    if (materialBatch.viscosityDeviationPct != null) {
      bits.push(`viscosity deviation ${materialBatch.viscosityDeviationPct}%`);
    }
    out.push(`- ${materialBatch.batchCode ?? 'Batch'}: ${bits.join(', ')}`);
  }

  out.push(
    '',
    '**RECOMMENDED NEXT ACTION**',
    activeAlerts.length > 0
      ? 'Open the Alerts or Investigations module to review the highest-priority item above and dispatch a corrective work order.'
      : 'No immediate action needed — check back after the next telemetry cycle.',
  );

  out.push(
    '',
    '_AI reasoning engine is temporarily unavailable — this summary is generated directly from live operational data, not AI analysis._',
  );

  return out.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemInstruction = `You are FactoryLens AI Copilot, an industrial operations intelligence advisor for Food & Beverage manufacturing plants.
You analyze production loss, equipment telemetry, quality deviations, material batches, downtime, and waste.

Rules for your responses:
1. Always be specific, operational, and decision-oriented.
2. Structure your reply with:
   - DIRECT ANSWER (1-2 sentences summarizing the conclusion)
   - KEY OPERATIONAL METRICS & EVIDENCE (bullet points distinguishing FACTS from INFERENCES)
   - BUSINESS IMPACT (quantified lost units, revenue risk, or downtime cost)
   - RECOMMENDED NEXT ACTION (immediate operational step with suggested owner)
3. Clearly label DIRECT FACTS (e.g. "[FACT] Vibration reached 3.31 mm/s") vs INFERENCES (e.g. "[INFERENCE] Valve diaphragm wear is probable cause").
4. Never sound like a generic chatbot. Sound like a veteran plant engineering director and loss-prevention analyst.
`;

    // Tries every model in GEMINI_MODELS (env, comma-separated) in order before giving up —
    // see lib/server/gemini.ts. Only falls through to the context-grounded fallback below if
    // every candidate model actually failed (or there's no API key at all).
    const result = await generateWithGemini({
      contents: `OPERATIONAL CONTEXT:\n${JSON.stringify(context || {}, null, 2)}\n\nUSER QUESTION:\n${prompt}`,
      systemInstruction,
    });

    if (result) {
      return NextResponse.json({ text: result.text, source: result.model });
    }

    // Gemini unavailable (no key, every candidate model failed) — fall back to a response built
    // from the real context data instead of a fixed scripted scenario.
    const text = buildContextualFallback((context as AssistantContext) || {});
    return NextResponse.json({ text, source: 'context-fallback' });
  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
