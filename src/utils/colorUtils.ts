export const getContrastTextColor = (hexColor: string): 'black' | 'white' => {
  // Remove '#' if present
  const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

  // Parse r, g, b values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Calculate luminance (per WCAG 2.0, relative luminance formula)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Use a threshold to determine if text should be white or black
  // A common threshold is 0.5, but can be adjusted
  return luminance > 0.5 ? 'black' : 'white';
};
