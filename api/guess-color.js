// api/guess-color.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text for color analysis is required.' });
  }

  try {
    // Fallback local pour les noms de couleurs courants (Point 3 de la demande)
    const colorMap = {
      'bleu': '#4a70b5',
      'rouge': '#ef4444',
      'vert': '#22c55e',
      'jaune': '#eab308',
      'noir': '#09090b',
      'blanc': '#ffffff',
      'gris': '#71717a',
      'indigo': '#6366f1',
      'violet': '#8b5cf6',
      'rose': '#ec4899',
      'orange': '#f97316',
      'marron': '#78350f',
      'olive': '#5A5A40',
      'ciel': '#0ea5e9',
      'ocean': '#0369a1',
      'foret': '#14532d',
      'or': '#fbbf24',
      'argent': '#d1d5db'
    };

    const normalizedInput = text.toLowerCase().trim();
    
    // Check if it's already a hex
    if (/^#([0-9A-F]{3}){1,2}$/i.test(normalizedInput)) {
      return res.status(200).json({ hex: normalizedInput });
    }
    
    const foundHex = colorMap[normalizedInput] || Object.entries(colorMap).find(([name]) => normalizedInput.includes(name))?.[1];

    if (foundHex) {
      return res.status(200).json({ hex: foundHex });
    }

    // Default fallback if not found
    return res.status(200).json({ hex: '#4a70b5' });

  } catch (error) {
    console.error('API Error in guess-color:', error);
    res.status(500).json({ message: 'Failed to guess color.', details: error.message });
  }
}
