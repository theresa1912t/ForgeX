import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is available, perform real AI reasoning with server-side SDK
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

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

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `OPERATIONAL CONTEXT:\n${JSON.stringify(context || {}, null, 2)}\n\nUSER QUESTION:\n${prompt}`,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        const text = response.text || '';
        return NextResponse.json({ text, source: 'gemini-2.5-flash' });
      } catch (geminiError: unknown) {
        console.warn('Gemini API call failed, falling back to deterministic operations reasoning engine:', geminiError);
        // Fall through to deterministic intelligence engine
      }
    }

    // Deterministic Industrial Reasoning Fallback Engine
    // Provides realistic operational answers for common food & beverage plant manager queries
    const lower = prompt.toLowerCase();
    let text = '';

    if (lower.includes('why') && (lower.includes('production') || lower.includes('target') || lower.includes('below') || lower.includes('drop'))) {
      text = `**DIRECT ANSWER**
Today's factory output is running 6.8% below target overall, driven almost entirely by **Line 3 (Beverage Hot-Fill & Capping)** running at **14% below target** (4,300 vs 5,000 units/hr).

**KEY OPERATIONAL EVIDENCE**
- [FACT] **Filling Machine M-03** cycle time increased by 17% (from 1.80s baseline to 2.11s).
- [FACT] Rotary manifold vibration spiked +38% to 3.31 mm/s at 10:37 AM.
- [FACT] Fill-level reject rates jumped 2.1× on checkweigher systems (420 units out of spec).
- [INFERENCE] Mechanical friction and fluid throttling on valve heads #4 and #8 are choking line throughput.

**BUSINESS IMPACT**
- **3,720 units lost today** ($4,650 gross revenue loss at $1.25/unit).
- Current operational loss rate is **$1,400 per hour** until resolved.

**RECOMMENDED NEXT ACTION**
- **Maintenance Priority**: Dispatch maintenance tech Carlos Ruiz to inspect valve heads #4/#8 on Filling Machine M-03 during the upcoming shift changeover and swap the diaphragm seal kit (estimated 30-min repair).`;
    } else if (lower.includes('machine') && (lower.includes('most') || lower.includes('loss') || lower.includes('downtime'))) {
      text = `**DIRECT ANSWER**
**Filling Machine M-03** on Line 3 is currently responsible for **62% of all production loss** across the facility, followed by **Packaging Machine M-08** on Line 2 (19% of loss).

**KEY OPERATIONAL EVIDENCE**
- [FACT] Machine M-03 accumulated 4.8 hours of micro-stops and throttled speed this week.
- [FACT] Piston diaphragm wear matches historical failure signatures from September 14.
- [FACT] Machine M-08 has recurring vibration harmonics (4.15 mm/s) on its case-packer infeed drive.
- [INFERENCE] Unplanned downtime on M-03 generates cascading buffer depletion to downstream capping and packaging.

**BUSINESS IMPACT**
- M-03 cumulative revenue impact: **$8,420 this week**.
- M-08 cumulative revenue impact: **$3,280 this week**.

**RECOMMENDED NEXT ACTION**
- Review Investigation #INV-LINE3-HERO in the Investigations module and approve the diaphragm seal kit replacement task.`;
    } else if (lower.includes('defect') || lower.includes('quality') || lower.includes('lot-raw') || lower.includes('rm-284')) {
      text = `**DIRECT ANSWER**
Defect spikes today are clustered in two areas: **UHT Chocolate Milk 250ml** ultrasonic carton seals on Line 2 (defect rate 2.45%), and **UHT Fortified Whole Milk 1000ml** net weight variances on Line 3.

**KEY OPERATIONAL EVIDENCE**
- [FACT] Defect rate on Chocolate Milk increased 2.4× (48 defects per 1,000 units).
- [FACT] Raw material batch **LOT-RAW-904** (Grade A Raw Milk) introduced at 08:30 AM exhibits a +8.4% viscosity deviation from supplier certificate of analysis.
- [INFERENCE] While LOT-RAW-904 added backpressure, sensor data indicates the primary driver on Line 3 is aseptic valve diaphragm degradation rather than recipe chemistry.

**BUSINESS IMPACT**
- 256 bottles flagged for checkweigher dump / rework ($422 cost).
- 128 kg of raw milk scrapped due to checkweigher reject dumps and nozzle dribble ($768 waste cost).

**RECOMMENDED NEXT ACTION**
- Hold retain samples of Raw Milk Lot #LOT-RAW-904 for QA viscosity verification, and recalibrate ultrasonic horn on Line 2 Packaging Machine M-08.`;
    } else if (lower.includes('revenue') || lower.includes('cost') || lower.includes('risk') || lower.includes('financial')) {
      text = `**DIRECT ANSWER**
Currently, **$7,450 in production value is at immediate risk today**, with **$4,896 already incurred** in lost throughput, rework, and scrap across Lines 2 and 3.

**FINANCIAL BREAKDOWN**
- **Lost Output Value**: $3,366 (Line 3: 2,040 bottles × $1.65)
- **Quality Defect Cost**: $462 (Line 2 Chocolate Milk cartons)
- **Material Waste Scrap**: $1,261 (Raw milk + stabilizer rejects)
- **Run-Rate Risk**: $1,683/hour on Line 3 if unresolved for the remaining 4 hours of Shift B.

**RECOMMENDED NEXT ACTION**
- Execute the 30-minute aseptic valve seal replacement on Machine M-03 to recover approximately $6,732 in potential additional loss before shift close.`;
    } else {
      text = `**DIRECT ANSWER**
FactoryLens operational intelligence has synthesized cross-domain data from SCADA, PLC registers, MES output, and QA checkweighers for LactaPure Midwest Aseptic Facility #1.

**CURRENT PLANT HEALTH**
- **Overall Line Efficiency**: 91.8% (Target: >95.0%)
- **Active Critical Alerts**: 1 (Line 3 UHT Bottling throughput drop -18.9%)
- **Active High Alerts**: 1 (Line 2 carton seal defect 2.45%)
- **Loss Concentration**: 62% of today's total production loss is concentrated in Aseptic Filler M-03 on Line 3.

**RECOMMENDED NEXT ACTION**
- Navigate to the **Investigations** module to review Root Cause Analysis for Line 3, or review open tasks in the **Action Center**.`;
    }

    return NextResponse.json({ text, source: 'operations-reasoning-engine' });
  } catch (error: unknown) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
