"use client";

import { Prospect, Client, MarketingEvent } from "@/types";
import {
  PROSPECT_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PRIORITY_LABELS,
  SERVICE_STATUS_LABELS,
} from "@/lib/constants";
import { formatTimestamp } from "@/lib/firebase/firestore";

// ==================== PDF EXPORT ====================

export async function exportProspectsToPDF(prospects: Prospect[], title: string = "Laporan Data Prospek") {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 14, 28);
  doc.text(`Total: ${prospects.length} data`, 14, 34);

  // Table
  autoTable(doc, {
    startY: 40,
    head: [["No", "Perusahaan", "PIC", "Telepon PIC", "Status", "Prioritas", "Sumber Lead", "CCD", "Kota", "Tanggal Input"]],
    body: prospects.map((p, i) => [
      i + 1,
      p.companyName || "-",
      p.picName || "-",
      p.picPhone || "-",
      PROSPECT_STATUS_LABELS[p.status] || p.status,
      p.priority ? (PRIORITY_LABELS[p.priority] || p.priority) : "-",
      LEAD_SOURCE_LABELS[p.leadSource] || p.leadSource,
      p.ccdName || "-",
      p.city || "-",
      formatTimestamp(p.createdAt),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`prospek_${new Date().toISOString().split("T")[0]}.pdf`);
}

export async function exportClientsToPDF(clients: Client[], title: string = "Laporan Klien Aktif") {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`, 14, 28);
  doc.text(`Total: ${clients.length} klien`, 14, 34);

  autoTable(doc, {
    startY: 40,
    head: [["No", "Perusahaan", "PIC", "Telepon", "Email", "Layanan", "Status", "PIC Internal", "Deadline"]],
    body: clients.map((c, i) => [
      i + 1,
      c.companyName || "-",
      c.picName || "-",
      c.picPhone || "-",
      c.picEmail || "-",
      c.serviceType || "-",
      SERVICE_STATUS_LABELS[c.serviceStatus] || c.serviceStatus,
      c.picInternalName || "-",
      formatTimestamp(c.projectDeadline),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`klien_aktif_${new Date().toISOString().split("T")[0]}.pdf`);
}

export async function exportReportToPDF(
  prospects: Prospect[],
  clients: Client[],
  events: MarketingEvent[]
) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Laporan Performa Marketing", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Periode: ${new Date().getFullYear()}`, 14, 28);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 14, 34);

  // Summary
  const closingCount = prospects.filter((p) => p.status === "closing").length;
  const closingRate = prospects.length > 0 ? Math.round((closingCount / prospects.length) * 100) : 0;

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Ringkasan", 14, 46);

  autoTable(doc, {
    startY: 50,
    head: [["Metrik", "Jumlah"]],
    body: [
      ["Total Prospek", prospects.length.toString()],
      ["Total Klien Aktif", clients.length.toString()],
      ["Total Event", events.length.toString()],
      ["Closing", closingCount.toString()],
      ["Closing Rate", `${closingRate}%`],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });

  // Status distribution
  const lastY = (doc as any).lastAutoTable.finalY + 10;
  doc.text("Distribusi Status Prospek", 14, lastY);

  const statusCounts = Object.entries(PROSPECT_STATUS_LABELS).map(([value, label]) => [
    label,
    prospects.filter((p) => p.status === value).length.toString(),
  ]);

  autoTable(doc, {
    startY: lastY + 4,
    head: [["Status", "Jumlah"]],
    body: statusCounts,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
  });

  // Lead source distribution
  const lastY2 = (doc as any).lastAutoTable.finalY + 10;
  doc.text("Distribusi Sumber Lead", 14, lastY2);

  const leadCounts = Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => [
    label,
    prospects.filter((p) => p.leadSource === value).length.toString(),
  ]);

  autoTable(doc, {
    startY: lastY2 + 4,
    head: [["Sumber Lead", "Jumlah"]],
    body: leadCounts,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [245, 158, 11] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`laporan_marketing_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ==================== EXCEL EXPORT ====================

export async function exportProspectsToExcel(prospects: Prospect[]) {
  const XLSX = await import("xlsx");

  const data = prospects.map((p, i) => ({
    "No": i + 1,
    "Perusahaan": p.companyName || "",
    "Nomor Kantor": p.officePhone || "",
    "Direktur": p.directorName || "",
    "Kecamatan": p.district || "",
    "Kota": p.city || "",
    "Bidang Usaha": p.businessField || "",
    "Jumlah Karyawan": p.employeeCount || 0,
    "SS/TS": p.ssTs || "",
    "Nama PIC": p.picName || "",
    "HP PIC": p.picPhone || "",
    "Email PIC": p.picEmail || "",
    "Status": PROSPECT_STATUS_LABELS[p.status] || p.status,
    "Prioritas": p.priority ? (PRIORITY_LABELS[p.priority] || p.priority) : "",
    "Sumber Lead": LEAD_SOURCE_LABELS[p.leadSource] || p.leadSource,
    "CCD": p.ccdName || "",
    "Tanggal Kirim": formatTimestamp(p.sendDate),
    "Tanggal Input": formatTimestamp(p.createdAt),
    "Catatan": p.notes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prospek");

  // Auto-width columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String((row as any)[key] || "").length)),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `prospek_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export async function exportClientsToExcel(clients: Client[]) {
  const XLSX = await import("xlsx");

  const data = clients.map((c, i) => ({
    "No": i + 1,
    "Perusahaan": c.companyName || "",
    "Nama PIC": c.picName || "",
    "HP PIC": c.picPhone || "",
    "Email PIC": c.picEmail || "",
    "Jenis Layanan": c.serviceType || "",
    "Status Layanan": SERVICE_STATUS_LABELS[c.serviceStatus] || c.serviceStatus,
    "PIC Internal": c.picInternalName || "",
    "Tanggal Sign": formatTimestamp(c.signDate),
    "Deadline": formatTimestamp(c.projectDeadline),
    "Catatan": c.serviceNotes || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Klien Aktif");

  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String((row as any)[key] || "").length)),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `klien_aktif_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export async function exportReportToExcel(
  prospects: Prospect[],
  clients: Client[],
  events: MarketingEvent[]
) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const closingCount = prospects.filter((p) => p.status === "closing").length;
  const summaryData = [
    { "Metrik": "Total Prospek", "Jumlah": prospects.length },
    { "Metrik": "Total Klien Aktif", "Jumlah": clients.length },
    { "Metrik": "Total Event", "Jumlah": events.length },
    { "Metrik": "Closing", "Jumlah": closingCount },
    { "Metrik": "Closing Rate", "Jumlah": `${prospects.length > 0 ? Math.round((closingCount / prospects.length) * 100) : 0}%` },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

  // Prospects sheet
  const prospectsData = prospects.map((p, i) => ({
    "No": i + 1,
    "Perusahaan": p.companyName || "",
    "PIC": p.picName || "",
    "Status": PROSPECT_STATUS_LABELS[p.status] || p.status,
    "Sumber Lead": LEAD_SOURCE_LABELS[p.leadSource] || p.leadSource,
    "CCD": p.ccdName || "",
    "Kota": p.city || "",
    "Tanggal Input": formatTimestamp(p.createdAt),
  }));
  const wsProspects = XLSX.utils.json_to_sheet(prospectsData);
  XLSX.utils.book_append_sheet(wb, wsProspects, "Prospek");

  // Clients sheet
  const clientsData = clients.map((c, i) => ({
    "No": i + 1,
    "Perusahaan": c.companyName || "",
    "PIC": c.picName || "",
    "Layanan": c.serviceType || "",
    "Status": SERVICE_STATUS_LABELS[c.serviceStatus] || c.serviceStatus,
    "PIC Internal": c.picInternalName || "",
    "Deadline": formatTimestamp(c.projectDeadline),
  }));
  const wsClients = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(wb, wsClients, "Klien");

  XLSX.writeFile(wb, `laporan_marketing_${new Date().toISOString().split("T")[0]}.xlsx`);
}
