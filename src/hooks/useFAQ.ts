"use client";
import React from "react";
import type { FAQData } from "@/types/faq";
import { fetchFAQ } from "@/services/faqService";

export function useFAQ() {
  const [data, setData] = React.useState<FAQData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    fetchFAQ()
      .then((d) => {
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error } as const;
}

