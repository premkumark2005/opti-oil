import 'dotenv/config';

async function test() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    const embedModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent'));
    console.log('Available embed models:', embedModels.map(m => m.name));
  } else {
    console.log('Error fetching:', data);
  }
}
test();
