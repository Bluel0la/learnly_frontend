
import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  // Function to render LaTeX using KaTeX
  const renderLatex = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: true,
        fleqn: true, // Always left align
      });
    } catch (error) {
      console.error('LaTeX render error:', error);
      return `<span style="color: #cc0000;">${latex}</span>`;
    }
  };

  // Function to process content and handle LaTeX
  const processContent = (text: string) => {
    // Handle display math first ($$...$$)
    let processedText = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), true);
      return `<div class="math-display">${rendered}</div>`;
    });

    // Handle inline math ($...$)
    processedText = processedText.replace(/\$([^$\n]+?)\$/g, (match, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), false);
      return `<span class="math-inline">${rendered}</span>`;
    });

    // Handle other formatting
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
    processedText = processedText.replace(/✅/g, '<span class="text-green-600">✅</span>');

    // Convert newlines to <br> tags
    processedText = processedText.replace(/\n/g, '<br>');

    return processedText;
  };

  return (
    <div 
      className="w-full text-left leading-relaxed"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default LaTeXRenderer;
