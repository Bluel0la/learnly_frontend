import React from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import DOMPurify from 'dompurify';

interface LaTeXRendererProps {
  content: string;
}

const SecureLaTeXRenderer: React.FC<LaTeXRendererProps> = ({ content }) => {
  const renderLatex = (latex: string, displayMode: boolean = false) => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: "#cc0000",
        strict: "warn",
        trust: false, // Changed to false for security
        fleqn: displayMode,
        // Restrict allowed functions for security
        macros: {},
      });
    } catch (error) {
      console.error("LaTeX render error:", error);
      // Return safely escaped error message
      return `<span style="color: #cc0000;">${DOMPurify.sanitize(latex)}</span>`;
    }
  };

  const processContent = (text: string): string => {
    let processed = text;

    // Handle \begin{aligned}...\end{aligned} blocks
    processed = processed.replace(
      /\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g,
      (match, content) => {
        const rendered = renderLatex(match, true);
        return `<div class="math-display my-4 overflow-x-auto">${rendered}</div>`;
      }
    );

    // Handle \text{...} blocks - render as regular text with sanitization
    processed = processed.replace(/\\text\{([^}]*)\}/g, (match, textContent) => {
      return DOMPurify.sanitize(textContent);
    });

    // Handle display math blocks $$...$$
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), true);
      return `<div class="math-display my-4 overflow-x-auto">${rendered}</div>`;
    });

    // Handle inline math $...$
    processed = processed.replace(/\$([^$\n]+?)\$/g, (match, mathContent) => {
      const rendered = renderLatex(mathContent.trim(), false);
      return `<span class="math-inline">${rendered}</span>`;
    });

    // Handle arrow symbols safely
    processed = processed.replace(/\\rightarrow|→/g, '→');
    processed = processed.replace(/\\leftarrow|←/g, '←');

    // Bold formatting **text** with sanitization
    processed = processed.replace(/\*\*(.*?)\*\*/g, (match, content) => {
      const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      return `<strong>${sanitized}</strong>`;
    });

    // Inline code `text` with sanitization
    processed = processed.replace(/`([^`]+)`/g, (match, content) => {
      const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
      return `<code class="bg-muted px-1 rounded text-sm font-mono">${sanitized}</code>`;
    });

    // Handle checkmarks and other symbols safely
    processed = processed.replace(/✅/g, '<span class="text-green-600">✅</span>');
    processed = processed.replace(/❌/g, '<span class="text-red-600">❌</span>');

    // Convert newlines to line breaks
    processed = processed.replace(/\n/g, "<br>");

    return processed;
  };

  // Sanitize the final HTML output
  const sanitizeConfig = {
    ALLOWED_TAGS: [
      'div', 'span', 'strong', 'code', 'br', 
      // KaTeX specific tags
      'math', 'mrow', 'msup', 'mi', 'mn', 'mo', 'mfrac', 'msqrt', 'mroot',
      'mtable', 'mtr', 'mtd', 'munder', 'mover', 'munderover', 'mtext',
      'mspace', 'mpadded', 'mphantom', 'semantics', 'annotation'
    ],
    ALLOWED_ATTR: [
      'class', 'style', 'aria-hidden', 'data-*',
      // KaTeX specific attributes
      'mathvariant', 'mathsize', 'mathcolor', 'mathbackground'
    ],
    ALLOW_DATA_ATTR: true,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  };

  const processedContent = processContent(content);
  const sanitizedContent = DOMPurify.sanitize(processedContent, sanitizeConfig);

  return (
    <div
      className="w-full text-left leading-relaxed whitespace-normal latex-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SecureLaTeXRenderer;