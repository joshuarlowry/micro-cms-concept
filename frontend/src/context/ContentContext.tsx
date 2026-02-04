import React, { createContext, useState, useCallback, ReactNode } from "react";

export interface ContentItem {
  type: "plain" | "markdown" | "rich_json";
  value: string | null;
}

export interface ContentContextType {
  content: Record<string, ContentItem>;
  mode: "published" | "draft";
  setMode: (mode: "published" | "draft") => void;
  fetchContent: (keys: string[]) => Promise<void>;
  saveContent: (key: string, type: string, value: string) => Promise<void>;
  publishContent: (key: string, value?: string) => Promise<void>;
  getRevisions: (key: string) => Promise<any[]>;
  restoreRevision: (key: string, revisionId: string, targetMode: string) => Promise<void>;
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);

export interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [content, setContent] = useState<Record<string, ContentItem>>({});
  const [mode, setMode] = useState<"published" | "draft">(() => {
    const saved = localStorage.getItem("cms-mode");
    return (saved as "published" | "draft") || "published";
  });

  const updateMode = useCallback((newMode: "published" | "draft") => {
    setMode(newMode);
    localStorage.setItem("cms-mode", newMode);
  }, []);

  const fetchContent = useCallback(async (keys: string[]) => {
    try {
      const response = await fetch(`/api/content?keys=${keys.join(",")}&mode=${mode}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }, [mode]);

  const saveContent = useCallback(async (key: string, type: string, value: string) => {
    try {
      const response = await fetch(`/api/content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      if (response.ok) {
        // Update local cache
        setContent((prev) => ({
          ...prev,
          [key]: { type: type as any, value },
        }));
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  }, []);

  const publishContent = useCallback(async (key: string, value?: string) => {
    try {
      const response = await fetch(`/api/content/${key}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (response.ok) {
        // Refresh content
        await fetchContent([key]);
      }
    } catch (error) {
      console.error("Error publishing content:", error);
    }
  }, [fetchContent]);

  const getRevisions = useCallback(async (key: string) => {
    try {
      const response = await fetch(`/api/content/${key}/revisions?limit=20`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Error fetching revisions:", error);
      return [];
    }
  }, []);

  const restoreRevision = useCallback(async (key: string, revisionId: string, targetMode: string) => {
    try {
      const response = await fetch(`/api/content/${key}/restore/${revisionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_mode: targetMode }),
      });
      if (response.ok) {
        // Refresh content
        await fetchContent([key]);
      }
    } catch (error) {
      console.error("Error restoring revision:", error);
    }
  }, [fetchContent]);

  const value: ContentContextType = {
    content,
    mode,
    setMode: updateMode,
    fetchContent,
    saveContent,
    publishContent,
    getRevisions,
    restoreRevision,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};
