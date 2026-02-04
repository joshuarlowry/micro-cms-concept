import React, { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const safeHtml = useMemo(() => {
    if (!content) return "";

    try {
      const tokens = marked.lexer(content);
      const filtered = tokens.filter((token) => {
        // Only allow safe token types
        return ["heading", "paragraph", "list", "blockquote", "code", "hr", "text"].includes(
          token.type
        );
      });

      const parsed = marked.parser(filtered);

      // Sanitize the HTML
      const config = {
        ALLOWED_TAGS: [
          "p",
          "a",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "code",
          "pre",
          "h2",
          "h3",
          "blockquote",
          "hr",
          "br",
        ],
        ALLOWED_ATTR: ["href", "title"],
        ALLOW_DATA_ATTR: false,
      };

      return DOMPurify.sanitize(parsed, config);
    } catch (error) {
      console.error("Error rendering markdown:", error);
      return DOMPurify.sanitize(`<p>${content}</p>`);
    }
  }, [content]);

  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
};
