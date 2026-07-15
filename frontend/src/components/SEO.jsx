import React, { useEffect } from "react";

/**
 * SEO Manager Component.
 * Dynamically updates document title, description, and keywords.
 */
export default function SEO({ title, description, keywords }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    // Dynamic Description tag update
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.content = description;
    }

    // Dynamic Keywords tag update
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    if (keywords) {
      metaKeywords.content = keywords;
    }
  }, [title, description, keywords]);

  return null;
}
