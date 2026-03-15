"use client";

import { useState, useCallback } from "react";
import { devLog } from "@/lib/devLog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { A4_DIMENSIONS } from "./invoice.constants";

export function useInvoicePdf(invoiceRef: React.RefObject<HTMLDivElement | null>, invoiceNumber: string) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = useCallback(async () => {
    if (!invoiceRef.current) return;

    const invoiceElement = invoiceRef.current.querySelector("[data-invoice-container]") as HTMLElement;
    if (!invoiceElement) {
      devLog("Invoice container not found");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const originalStyles: { element: HTMLElement; display: string }[] = [];
      invoiceElement.querySelectorAll('.print\\:hidden').forEach((el) => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({ element: htmlEl, display: htmlEl.style.display });
        htmlEl.style.display = "none";
      });

      const originalBg = invoiceElement.style.backgroundColor;
      invoiceElement.style.backgroundColor = "#ffffff";

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: invoiceElement.scrollWidth,
        height: invoiceElement.scrollHeight,
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
      });

      originalStyles.forEach(({ element, display }) => {
        element.style.display = display;
      });
      invoiceElement.style.backgroundColor = originalBg;

      const { widthMm: a4W, heightMm: a4H } = A4_DIMENSIONS;
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("portrait", "mm", "a4");
      const imgHeightMm = (canvas.height * a4W) / canvas.width;

      if (imgHeightMm <= a4H) {
        pdf.addImage(imgData, "PNG", 0, 0, a4W, imgHeightMm);
      } else {
        const scale = a4H / imgHeightMm;
        pdf.addImage(imgData, "PNG", 0, 0, a4W * scale, a4H);
      }

      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      devLog("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [invoiceRef, invoiceNumber]);

  return { generatePDF, isGeneratingPDF };
}
