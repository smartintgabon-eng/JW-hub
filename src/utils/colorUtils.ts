export const getContrastTextColor = (hexColor: string): 'black' | 'white' => {
  if (!hexColor || typeof hexColor !== 'string') {
    return 'white'; // Default for invalid input
  }

  // Remove '#' if present
  let cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  // Handle 3-digit hex codes
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  // Check for valid 6-digit hex
  if (!/^[0-9a-fA-F]{6}$/.test(cleanHex)) {
      return 'white'; // Return default for invalid format
  }

  // Parse r, g, b values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // If parsing fails, it will be NaN. Check for that.
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return 'white';
  }

  // Calculate luminance (per WCAG 2.0, relative luminance formula)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Use a threshold to determine if text should be white or black
  return luminance > 0.5 ? 'black' : 'white';
};
