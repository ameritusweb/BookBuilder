// src/utils/syntaxHighlight.js
import Prism from 'prismjs';
import 'prismjs/components/prism-csharp';

if (typeof window !== 'undefined') {
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
}

const colorMap = {
    'keyword': '#005cc5',       // Deep blue
    'string': '#a31515',        // Dark red
    'comment': '#6a737d',       // Muted dark gray-blue
    'class-name': '#2b91af',    // Bold teal-blue
    'function': '#795e26',      // Rich brown
    'number': '#008080',        // Dark teal
    'operator': '#000000',      // Solid black
    'punctuation': '#333333'    // Dark gray
  };

// Helper function to flatten nested tokens
const flattenToken = (token) => {
  if (typeof token === 'string') {
    return { text: token, color: '#a31515' };
  }
  
  if (Array.isArray(token.content)) {
    return token.content.map(t => flattenToken(t));
  }
  
  return {
    text: token.content || token,
    color: colorMap[token.type] || '#333333' // Default to dark gray for unknown types
  };
};

export const convertHighlightedCodeToPDF = (code) => {
  try {
    const lines = code.split('\n');
    let pdfContent = [];

    lines.forEach((line, lineIndex) => {
      const tokens = Prism.tokenize(line, Prism.languages.csharp);
      const flatTokens = tokens.map(flattenToken).flat();
      
      // Create a content array for this line
      const lineContent = {
        columns: [
          {
            width: 30,
            text: (lineIndex + 1).toString(),
            color: '#858585',
            alignment: 'left',
            fontSize: 10,
            margin: [0, 0, 8, 4]
          },
          {
            fontSize: 10,
            text: flatTokens.map(token => ({
              text: token.text,
              color: token.color
            }))
          }
        ]
      };
      
      pdfContent.push(lineContent);
    });

    return pdfContent;
  } catch (error) {
    console.error('Error processing code:', error);
    // Fallback to plain text if highlighting fails
    return [{ text: code, color: '#000000' }];
  }
};