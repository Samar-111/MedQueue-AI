import { GoogleGenAI } from '@google/genai';
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
  'heart attack', 'unresponsive', 'poisoning', 'head trauma', 'burn', 'burning',
  'scald', 'fire', 'chemical burn', 'flame'
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

export async function generateFollowUpQuestion(history, language = 'en-US') {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const conversationText = Array.isArray(history)
    ? history.map((m) => `${m.role === 'patient' ? 'Patient' : 'AI Doctor'}: ${m.content}`).join('\n')
    : `Patient: ${history}`;

  const prompt = `You are an empathetic ER Triage Doctor AI evaluating a patient in an emergency intake.
Review the intake dialogue below:
${conversationText}

Determine if you need 1 more critical clinical follow-up question to accurately assign an Emergency Severity Index (ESI 1-5) tier.
Questions should clarify: exact pain location, onset time/duration, radiation, respiratory distress, or severe associated red flags.

If sufficient details exist or 3+ turns have occurred, mark isComplete as true.
Output MUST be valid JSON matching this schema:
{
  "nextQuestion": "Short 1-sentence targeted follow-up question (max 15 words)",
  "isComplete": boolean
}`;

  if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('YOUR_')) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return JSON.parse(response.text);
    } catch (error) {
      console.error('[Gemini Chat Error]:', error.message);
    }
  }

  if (openaiKey && openaiKey.trim() !== '' && !openaiKey.includes('YOUR_')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey.trim() });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('[OpenAI Chat Error]:', error.message);
    }
  }

  const textLower = conversationText.toLowerCase();
  if (textLower.includes('chest pain') && !textLower.includes('side') && !textLower.includes('arm')) {
    return { nextQuestion: 'Where exactly is the chest pain, and does it radiate to your arm or jaw?', isComplete: false };
  }
  if (!textLower.includes('ago') && !textLower.includes('start') && !textLower.includes('minute') && !textLower.includes('hour')) {
    return { nextQuestion: 'When did your symptoms start, and are they getting worse right now?', isComplete: false };
  }

  return { nextQuestion: 'Thank you. Processing complete clinical triage report.', isComplete: true };
}

export async function analyzeTriage(transcriptInput, language = 'en-US') {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const transcript = Array.isArray(transcriptInput)
    ? transcriptInput.map((m) => `${m.role === 'patient' ? 'Patient' : 'AI Doctor'}: ${m.content}`).join('\n')
    : transcriptInput;

  const prompt = `You are an expert ER Triage Physician AI. Analyze the following patient intake transcript (spoken language: ${language}).
Convert it into an Emergency Severity Index (ESI) classification from 1 to 5:
- ESI 1: Resuscitation (Immediate life-saving intervention needed, e.g. cardiac arrest, severe respiratory distress, unresponsive, airway/facial burns)
- ESI 2: Emergent (High risk, confused/lethargic/disoriented, severe pain/distress, severe burns, chemical burns, acute severe localized trauma)
- ESI 3: Urgent (Stable, requires 2+ resources like X-ray + labs)
- ESI 4: Less Urgent (Stable, requires 1 resource)
- ESI 5: Non-Urgent (Stable, no resources needed)

Identify any life-threatening red flags.

Output MUST be a valid JSON object matching this exact schema:
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

  if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('YOUR_')) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text;
      const parsed = JSON.parse(text);
      return TriageSchema.parse(parsed);
    } catch (error) {
      console.error('[Google Gemini Triage Error]:', error.message);
    }
  }

  if (openaiKey && openaiKey.trim() !== '' && !openaiKey.includes('YOUR_')) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey.trim() });
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
    }
  }

  return fallbackRuleTriage(transcript, language);
}
