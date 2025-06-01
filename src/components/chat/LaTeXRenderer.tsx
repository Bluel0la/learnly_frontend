import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  const renderLatex = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
      });
    } catch (error) {
      console.error('LaTeX render error:', error);
      return `<span style="color: #cc0000;">${latex}</span>`;
    }
  };

  const renderContent = (text: string) => {
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = blockMathRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(...renderInlineContent(textBefore, `text-${blockIndex}-before`));
      }

      const mathContent = match[1].trim();
      const renderedMath = renderLatex(mathContent, true);
      parts.push(
        <div
          key={`block-${blockIndex}`}
          className="my-4 overflow-x-auto max-w-full text-left"
          style={{ wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: renderedMath }}
        />
      );

      lastIndex = match.index + match[0].length;
      blockIndex++;
    }

    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(...renderInlineContent(remainingText, 'text-final'));
    }

    return parts.length > 0 ? parts : [renderInlineContent(text, 'text-only')];
  };

  const renderInlineContent = (text: string, keyPrefix: string) => {
    const inlineMathRegex = /\$([^$\n]+?)\$/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let matchIndex = 0;

    while ((match = inlineMathRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push(
            <span key={`${keyPrefix}-text-${matchIndex}`}>
              {formatPlainText(textBefore)}
            </span>
          );
        }
      }

      const mathContent = match[1].trim();
      const renderedMath = renderLatex(mathContent, false);
      parts.push(
        <span
          key={`${keyPrefix}-inline-${matchIndex}`}
          className="inline-block align-baseline"
          dangerouslySetInnerHTML={{ __html: renderedMath }}
        />
      );

      lastIndex = match.index + match[0].length;
      matchIndex++;
    }

    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push(
          <span key={`${keyPrefix}-text-final`}>
            {formatPlainText(remainingText)}
          </span>
        );
      }
    }

    return parts.length > 0 ? parts : [formatPlainText(text)];
  };

  const formatPlainText = (text: string) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
    formatted = formatted.replace(/✅/g, '<span class="text-green-600">✅</span>');

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="latex-content w-full text-left break-words">
      {renderContent(content)}
    </div>
  );
};

export default LaTeXRenderer;
