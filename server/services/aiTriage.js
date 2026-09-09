import OpenAI from 'openai';
import { z } from 'zod';

export const TriageSchema = z.object({
  translatedSummary: z.string(),
  chiefComplaint: z.string(),
  esiLevel: z.number().min(1).max(5),
  redFlags: z.array(z.string()),
  triageRationale: z.string(),
  recommendedAction: z.string(),
  estimatedTimeMinutes: z.number()
});

const RED_FLAG_KEYWORDS = [
  'chest pain', 'shortness of breath', 'can\'t breathe', 'difficulty breathing',
  'stroke', 'numbness', 'facial droop', 'unconscious', 'severe bleeding',
  'stabbing', 'gunshot', 'seizure', 'anaphylaxis', 'choking', 'cardiac',
  'heart attack', 'unresponsive', 'poisoning', 'head trauma'
];

function fallbackRuleTriage(transcript, language) {
  const textLower = transcript.toLowerCase();
  const foundFlags = [];

  for (const flag of RED_FLAG_KEYWORDS) {
    if (textLower.includes(flag)) {
      foundFlags.push(flag.toUpperCase());
    }
  }

  let esi = 4;
  let summary = transcript;
  let complaint = 'General Intake Symptoms';
  let rationale = 'Patient reported mild to moderate non-life-threatening discomfort.';
  let action = 'Standard nursing assessment & routine bed assignment.';
  let estimatedTime = 20;

  if (foundFlags.length > 0) {
    if (textLower.includes('chest pain') || textLower.includes('unconscious') || textLower.includes('cardiac') || textLower.includes('heart attack')) {
      esi = 1;
      complaint = 'Possible Acute Cardiac Event / Immediate Life Threat';
      rationale = 'Immediate resuscitation required due to critical symptom severity & red-flag detection.';
      action = 'Immediate trauma room activation, ECG, and emergency physician notification.';
      estimatedTime = 45;
    } else {
      esi = 2;
      complaint = 'Emergent High-Risk Clinical Symptoms';
      rationale = 'High risk of deterioration detected. Priority clinical intervention required.';
      action = 'Priority triage bed assignment, immediate vital sign monitoring, and urgent doctor evaluation.';
      estimatedTime = 30;
    }
  } else if (textLower.includes('fever') || textLower.includes('vomiting') || textLower.includes('pain') || textLower.includes('fracture') || textLower.includes('cut')) {
    esi = 3;
    complaint = 'Urgent Clinical Evaluation';
    rationale = 'Patient requires multiple diagnostic resources (lab/x-ray) but vital signs expected stable.';
    action = 'Standard queue placement, nurse triage assessment within 15 minutes.';
    estimatedTime = 25;
  }

  return {
    translatedSummary: `[Clinical Intake Summary (${language})]: ${summary}`,
    chiefComplaint: complaint,
    esiLevel: esi,
    redFlags: foundFlags.length > 0 ? foundFlags : ['None Detected'],
    triageRationale: rationale,
    recommendedAction: action,
    estimatedTimeMinutes: estimatedTime
  };
}

export async function analyzeTriage(transcript, language = 'en-US') {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_OPENAI_API_KEY')) {
    return fallbackRuleTriage(transcript, language);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const prompt = `You are an expert ER Triage Physician AI. Analyze the following patient intake transcript (spoken language: ${language}).
Convert it into an Emergency Severity Index (ESI) classification from 1 to 5:
- ESI 1: Resuscitation (Immediate life-saving intervention needed, e.g. cardiac arrest, severe respiratory distress, unresponsive)
- ESI 2: Emergent (High risk, confused/lethargic/disoriented, severe pain/distress)
- ESI 3: Urgent (Stable, requires 2+ resources like X-ray + labs)
- ESI 4: Less Urgent (Stable, requires 1 resource)
- ESI 5: Non-Urgent (Stable, no resources needed)

Identify any life-threatening red flags.

Output MUST be a valid JSON object matching this schema:
{
  "translatedSummary": "Clear English clinical summary of patient report",
  "chiefComplaint": "Short 3-6 word chief complaint",
  "esiLevel": number (1 to 5),
  "redFlags": ["Array of string red flags or 'None Detected'"],
  "triageRationale": "Detailed clinical rationale for assigned ESI level",
  "recommendedAction": "Immediate recommended medical action",
  "estimatedTimeMinutes": number
}

Patient Transcript: "${transcript}"`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an automated ER clinical triage algorithm adhering to Emergency Severity Index protocol.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return TriageSchema.parse(parsed);
  } catch (error) {
    console.error('[OpenAI Triage Error]:', error.message);
    return fallbackRuleTriage(transcript, language);
  }
}
