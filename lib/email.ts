import { Resend } from 'resend';
import OpenAI from 'openai';

export const resendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY');
  return new Resend(key);
};

export async function generateMatchEmailBody(payload: {
  carrierName?: string;
  matches: Array<{
    origin: string;
    destination: string;
    equipment: string;
    rate: string;
    pickup: string;
  }>;
}) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return basicTemplate(payload);
  }
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: `Write a concise HTML email for a carrier with these load matches. Brand as Deadhead Zero – Reverse Load Board operated by Deadhead Zero Logistics LLC. Keep it friendly and concise: ${JSON.stringify(payload.matches)}`,
    });
    const text = response.output[0]?.content[0]?.text || basicTemplate(payload);
    return text;
  } catch (err) {
    console.error('OpenAI fallback', err);
    return basicTemplate(payload);
  }
}

function basicTemplate(payload: {
  carrierName?: string;
  matches: Array<{
    origin: string;
    destination: string;
    equipment: string;
    rate: string;
    pickup: string;
  }>;
}) {
  const lines = payload.matches
    .map(
      (m) =>
        `<li><strong>${m.origin} → ${m.destination}</strong> (${m.equipment}) - ${m.rate}, pickup ${m.pickup}</li>`
    )
    .join('');
  return `<div style="font-family: Inter, Arial, sans-serif;">
    <h2>Hi ${payload.carrierName || 'there'}, new loads matched your intents</h2>
    <ul>${lines}</ul>
    <p>Deadhead Zero – Reverse Load Board™ keeps intents fresh for 48 hours. Update your lanes anytime.</p>
  </div>`;
}
