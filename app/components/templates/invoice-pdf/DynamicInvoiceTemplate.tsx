"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceType } from "@/types";

// Skeleton placeholder while template loads
const DynamicInvoiceTemplateSkeleton = () => {
  return <Skeleton className="min-h-[60rem]" />;
};

const DynamicInvoiceTemplate = (props: InvoiceType) => {
  const [DynamicInvoice, setDynamicInvoice] =
    useState<React.ComponentType<InvoiceType> | null>(null);

  const pdfTemplate = props.details?.pdfTemplate;

  useEffect(() => {
    if (!pdfTemplate) {
      console.warn("pdfTemplate is undefined or null");
      setDynamicInvoice(null);
      return;
    }

    const templateName = `InvoiceTemplate${pdfTemplate}`;

    const loadTemplate = async () => {
      try {
        const mod = await import(
          `@/app/components/templates/invoice-pdf/${templateName}`
        );
        if (mod?.default) {
          setDynamicInvoice(() => mod.default);
        } else {
          console.error(
            `Dynamic import did not return a default export for ${templateName}`
          );
          setDynamicInvoice(null);
        }
      } catch (err) {
        console.error(`Failed to load invoice template: ${templateName}`, err);
        setDynamicInvoice(null);
      }
    };

    loadTemplate();
  }, [pdfTemplate]);

  // Fallback skeleton while template is loading
  if (!DynamicInvoice) return <DynamicInvoiceTemplateSkeleton />;

  // Render the loaded template
  return <DynamicInvoice {...props} />;
};

export default DynamicInvoiceTemplate;
