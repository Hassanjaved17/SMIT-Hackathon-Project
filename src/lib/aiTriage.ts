import type { AITriageResult, Priority } from '../types';

/**
 * AI Issue Triage
 * ----------------
 * Converts a natural-language complaint into structured issue data.
 *
 * For the hackathon demo this runs as a safe, deterministic, keyword-based
 * classifier so it works with zero configuration and never exposes an API
 * key in the frontend. In production, replace the body of `runTriage` with
 * a call to a Supabase Edge Function that holds your LLM API key server-side
 * and returns the same AITriageResult shape. Keep the try/catch + timeout
 * here — it already implements the required loading/timeout/fallback states.
 */

const RULES: Array<{
  match: RegExp;
  category: string;
  priority: Priority;
  causes: string[];
  checks: string[];
  safety?: string;
}> = [
  {
    match: /(spark|shock|smoke|burning smell|exposed wire|electrical)/i,
    category: 'Electrical',
    priority: 'Critical',
    causes: ['Damaged wiring or insulation', 'Loose electrical connection', 'Component overheating'],
    checks: ['Disconnect power at the breaker immediately', 'Do not touch the unit until inspected', 'Keep the area clear of water and people'],
    safety: 'Electrical hazard suspected — treat as unsafe until a qualified technician confirms otherwise.',
  },
  {
    match: /(leak|water|dripping|flood)/i,
    category: 'Leakage / Plumbing',
    priority: 'High',
    causes: ['Blocked drain line', 'Worn seal or gasket', 'Condensation buildup'],
    checks: ['Turn off the unit if water is near electrical wiring', 'Place a container to catch dripping water', 'Inspect visible drainage lines'],
  },
  {
    match: /(noise|rattl|grind|squeak|vibrat)/i,
    category: 'Mechanical',
    priority: 'Medium',
    causes: ['Loose mounting or fastener', 'Worn bearing or belt', 'Foreign object in moving parts'],
    checks: ['Reduce use until inspected', 'Check for loose panels or covers', 'Avoid forcing any moving part'],
  },
  {
    match: /(not turning on|no power|dead|won.?t start|not working)/i,
    category: 'Electrical',
    priority: 'High',
    causes: ['Power supply interruption', 'Blown fuse or tripped breaker', 'Internal component failure'],
    checks: ['Confirm the power source and switch are on', 'Check the breaker panel for trips', 'Avoid repeated on/off cycling'],
  },
  {
    match: /(hdmi|display|flicker|screen|projector|no signal)/i,
    category: 'Electronics',
    priority: 'Medium',
    causes: ['Loose or damaged cable', 'Failing display component', 'Overheating from prolonged use'],
    checks: ['Reseat the cable at both ends', 'Try an alternate input source', 'Allow the unit to cool before further use'],
  },
  {
    match: /(fire|smoke|gas|explos)/i,
    category: 'Safety',
    priority: 'Critical',
    causes: ['Fire or gas hazard present'],
    checks: ['Evacuate the area if there is any immediate danger', 'Contact emergency services if required', 'Do not attempt self-repair'],
    safety: 'This may be a life-safety hazard. Contact a qualified technician or emergency services immediately.',
  },
];

function toTitleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function summarizeTitle(complaint: string): string {
  const trimmed = complaint.trim().replace(/\s+/g, ' ');
  const short = trimmed.length > 60 ? trimmed.slice(0, 57) + '…' : trimmed;
  return toTitleCase(short.replace(/^(the|my|our)\s+/i, ''));
}

export async function generatePreventiveRecommendation(
  assetCategory: string,
  lastServiceDate: string | null,
  recentIssueCount: number,
  issueCategories: string[]
): Promise<string> {
  // Deterministic preventive maintenance rules based on asset history
  const today = new Date();
  const lastService = lastServiceDate ? new Date(lastServiceDate) : null;
  const daysSinceService = lastService ? Math.floor((today.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24)) : 999;

  let recommendation = '';

  // General recommendations by category
  if (assetCategory === 'HVAC') {
    if (daysSinceService > 180) recommendation += 'Schedule quarterly maintenance. ';
    if (issueCategories.includes('Leakage')) recommendation += 'Check condensate drain lines. ';
    if (issueCategories.includes('Mechanical')) recommendation += 'Inspect filters and belts. ';
  } else if (assetCategory === 'Electronics') {
    if (daysSinceService > 365) recommendation += 'Perform annual hardware check. ';
    if (issueCategories.includes('Electrical')) recommendation += 'Check power connections and surge protection. ';
  } else if (assetCategory === 'Mechanical') {
    if (daysSinceService > 90) recommendation += 'Schedule preventive lubrication. ';
    if (issueCategories.includes('Mechanical')) recommendation += 'Inspect bearings and fasteners. ';
  }

  // Recurring issue detection
  if (recentIssueCount >= 3) {
    recommendation += 'Multiple issues detected recently—consider a full inspection or replacement evaluation. ';
  }

  return recommendation.trim() || 'Continue regular operational monitoring.';
}

export async function runTriage(
  complaint: string,
  assetContext: { name: string; category: string; recentIssueCount: number },
  timeoutMs = 4000
): Promise<AITriageResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('AI triage timed out. You can fill the fields in manually.')), timeoutMs);

    try {
      // Simulated processing delay so the loading state is visible in the demo.
      setTimeout(() => {
        clearTimeout(timer);

        if (!complaint || complaint.trim().length < 5) {
          reject(new Error('Please describe the issue in a bit more detail before running AI triage.'));
          return;
        }

        const rule = RULES.find((r) => r.match.test(complaint));

        const result: AITriageResult = {
          title: rule ? `${rule.category}: ${summarizeTitle(complaint)}` : summarizeTitle(complaint),
          category: rule?.category ?? assetContext.category ?? 'General',
          priority: rule?.priority ?? 'Medium',
          possible_causes: rule?.causes ?? ['Requires on-site inspection to determine root cause'],
          initial_checks: rule?.checks ?? ['Schedule a technician inspection', 'Avoid using the asset if it seems unsafe'],
          recurring_pattern_warning:
            assetContext.recentIssueCount >= 2
              ? `This asset has had ${assetContext.recentIssueCount} issues reported recently — consider a full inspection for recurring failure.`
              : null,
        };

        resolve(result);
      }, 650);
    } catch (e) {
      clearTimeout(timer);
      reject(e as Error);
    }
  });
}
