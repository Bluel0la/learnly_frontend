import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  // Render KaTeX safely
  const renderLatex = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: true,
        fleqn: true, // Align left
      });
    } catch (error) {
      console.error('LaTeX render error:', error);
      return `<span style="color: #cc0000;">${latex}</span>`;
    }
  };

  // Process the content
  const processContent = (text: string): string => {
    let processed = text;

    // 1. Handle \begin{aligned} ... \end{aligned} even if not wrapped
    processed = processed.replace(/\\begin{aligned}[\s\S]*?\\end{aligned}/g, (match) => {
      const wrapped = `\\[${match}\\]`; // or $$...$$
      const rendered = renderLatex(wrapped, true);
      return `<div class="math-display">${rendered}</div>`;
    });

    // 2. Handle display math blocks ($$...$$)
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), true);
      return `<div class="math-display">${rendered}</div>`;
    });

    // 3. Handle inline math ($...$)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (_, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), false);
      return `<span class="math-inline">${rendered}</span>`;
    });

    // 4. Bold formatting (**bold**)
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 5. Inline code blocks (`code`)
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');

    // 6. Emoji: ✅
    processed = processed.replace(/✅/g, '<span class="text-green-600">✅</span>');

    // 7. Convert newlines to <br> (optional: inside text only)
    processed = processed.replace(/\n/g, '<br>');

    return processed;
  };

  return (
    <div
      className="w-full text-left leading-relaxed"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default LaTeXRenderer;
