
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  // Function to process and render LaTeX content
  const renderContent = (text: string) => {
    // Handle block math ($$...$$)
    const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
    // Handle inline math ($...$)
    const inlineMathRegex = /\$([^$\n]+?)\$/g;
    
    let processedContent = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // First, handle block math
    let blockMatch;
    const blockMatches: Array<{ match: string; content: string; start: number; end: number }> = [];
    
    while ((blockMatch = blockMathRegex.exec(text)) !== null) {
      blockMatches.push({
        match: blockMatch[0],
        content: blockMatch[1],
        start: blockMatch.index,
        end: blockMatch.index + blockMatch[0].length
      });
    }
    
    // Process block math matches
    blockMatches.forEach((blockMatch, index) => {
      // Add text before the math block
      if (blockMatch.start > lastIndex) {
        const textBefore = text.slice(lastIndex, blockMatch.start);
        parts.push(...renderInlineContent(textBefore, `text-${index}-before`));
      }
      
      // Add the math block
      try {
        parts.push(
          <div key={`block-${index}`} className="my-4 overflow-x-auto">
            <BlockMath math={blockMatch.content.trim()} />
          </div>
        );
      } catch (error) {
        console.error('LaTeX block render error:', error);
        parts.push(
          <div key={`block-error-${index}`} className="my-4 p-2 bg-red-50 border border-red-200 rounded">
            <code className="text-red-600">{blockMatch.match}</code>
          </div>
        );
      }
      
      lastIndex = blockMatch.end;
    });
    
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
      try {
        parts.push(
          <InlineMath key={`${keyPrefix}-inline-${matchIndex}`} math={match[1].trim()} />
        );
      } catch (error) {
        console.error('LaTeX inline render error:', error);
        parts.push(
          <code key={`${keyPrefix}-inline-error-${matchIndex}`} className="bg-red-50 text-red-600 px-1 rounded">
            {match[0]}
          </code>
        );
      }
      
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
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert `code` to <code>
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
    // Convert ✅ to proper emoji styling
    formatted = formatted.replace(/✅/g, '<span class="text-green-600">✅</span>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };
  
  return (
    <div className="latex-content">
      {renderContent(content)}
    </div>
  );
};

export default LaTeXRenderer;
