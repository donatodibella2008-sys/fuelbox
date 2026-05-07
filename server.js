const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: Falta la variable de entorno ANTHROPIC_API_KEY');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'El campo "messages" es requerido y debe ser un array.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: system || '',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || `Error HTTP ${response.status}`;
      console.error('Anthropic API error:', errMsg);
      return res.status(response.status).json({ error: errMsg });
    }

    res.json(data);
  } catch (err) {
    console.error('Error al llamar a Anthropic:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Fallback: todas las rutas sirven index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FUELBOX corriendo en http://localhost:${PORT}`);
  console.log('API key configurada:', ANTHROPIC_API_KEY.slice(0, 20) + '...');
});
