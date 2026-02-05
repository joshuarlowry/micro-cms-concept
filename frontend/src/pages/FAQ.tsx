import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface FAQItem {
  question: string;
  answer_md: string;
}

export default function FAQ() {
  const { content, fetchContent, mode } = useContent();
  const [items, setItems] = useState<FAQItem[]>([]);

  useEffect(() => {
    fetchContent(["faq.items"]);
  }, [mode]);

  useEffect(() => {
    const faqContent = content["faq.items"]?.value;
    if (faqContent) {
      try {
        setItems(JSON.parse(faqContent));
      } catch (e) {
        console.error("Error parsing FAQ items:", e);
        setItems([]);
      }
    }
  }, [content]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Frequently Asked Questions</h1>
        <p className="subtitle">Find answers to common questions</p>
      </div>

      <div className="content-grid">
        {items.map((item, index) => (
          <div key={index} className="card">
            <h3>{item.question}</h3>
            <MarkdownRenderer content={item.answer_md} />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="card">
          <p>No FAQ items available. Go to <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/admin"; }}>/admin</a> to add some!</p>
        </div>
      )}
    </div>
  );
}
