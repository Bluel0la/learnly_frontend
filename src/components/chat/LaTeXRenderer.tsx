
import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface LaTeXRendererProps {
  content: string;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  // Function to render LaTeX using KaTeX directly
  const renderLatex = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: true,
        fleqn: displayMode, // Left align display math
      });
    } catch (error) {
      console.error('LaTeX render error:', error);
      return `<span style="color: #cc0000;">${latex}</span>`;
    }
  };

  // Function to process and render LaTeX content
  const renderContent = (text: string) => {
    // Handle block math ($$...$$) first
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;
    
    // Process block math matches
    while ((match = blockMathRegex.exec(text)) !== null) {
      // Add text before the math block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(...renderInlineContent(textBefore, `text-${blockIndex}-before`));
      }
      
      // Add the math block
      const mathContent = match[1].trim();
      const renderedMath = renderLatex(mathContent, true);
      parts.push(
        <div 
          key={`block-${blockIndex}`} 
          className="my-2 w-full overflow-x-auto"
        >
          <div 
            className="katex-display-wrapper text-left max-w-full"
            style={{ 
              fontSize: '1em',
              lineHeight: '1.4',
              minWidth: 'fit-content'
            }}
            dangerouslySetInnerHTML={{ __html: renderedMath }}
          />
        </div>
      );
      
      lastIndex = match.index + match[0].length;
      blockIndex++;
    }
    
    // Add remaining text after last block
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(...renderInlineContent(remainingText, 'text-final'));
    }
    
    return parts.length > 0 ? parts : [renderInlineContent(text, 'text-only')];
  };
  
  // Function to handle inline math and regular text
  const renderInlineContent = (text: string, keyPrefix: string) => {
    const inlineMathRegex = /\$([^$\n]+?)\$/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let matchIndex = 0;
    
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add text before the inline math
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
      
      // Add the inline math
      const mathContent = match[1].trim();
      const renderedMath = renderLatex(mathContent, false);
      parts.push(
        <span 
          key={`${keyPrefix}-inline-${matchIndex}`}
          className="katex-inline-wrapper"
          style={{ verticalAlign: 'baseline' }}
          dangerouslySetInnerHTML={{ __html: renderedMath }}
        />
      );
      
      lastIndex = match.index + match[0].length;
      matchIndex++;
    }
    
    // Add remaining text
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
  
  // Function to format plain text with basic formatting
  const formatPlainText = (text: string) => {
    // Split by newlines first to preserve line breaks
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Convert **bold** to <strong>
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Convert `code` to <code>
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
      // Convert ✅ to proper emoji styling
      formatted = formatted.replace(/✅/g, '<span class="text-green-600">✅</span>');
      
      return (
        <span key={lineIndex}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };
  
  return (
    <div className="latex-content w-full leading-relaxed text-left">
      {renderContent(content)}
    </div>
  );
};

export default LaTeXRenderer;
