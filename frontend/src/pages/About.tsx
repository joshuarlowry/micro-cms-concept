import { useEffect } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function About() {
  const { content, fetchContent, mode } = useContent();

  useEffect(() => {
    fetchContent(["about.page.body_md"]);
  }, [mode]);

  const body = content["about.page.body_md"]?.value || "";

  return (
    <div className="page">
      <div className="page-header">
        <h1>About Micro CMS</h1>
      </div>

      <div className="card">
        <MarkdownRenderer content={body} />
      </div>
    </div>
  );
}
