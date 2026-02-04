import { useContext } from "react";
import { ContentContext, ContentContextType } from "../context/ContentContext";

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
};
