import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { FeeRecord } from "../page";

  const generateInvoicePDF = (record: FeeRecord, action: "download" | "view") => {
    const doc = new jsPDF();

    // Institution Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ACADIFY INSTITUTE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Education Street, Learning City, India", 105, 27, {
      align: "center",
    });
    doc.text("Phone: +91 98765 43210 | Email: admin@acadify.com", 105, 32, {
      align: "center",
    });
    doc.text("GST No: 29ABCDE1234F1Z5", 105, 37, { align: "center" });

    // Invoice Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", 105, 50, { align: "center" });

    // Invoice Details Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${record.invoice_number}`, 20, 65);
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 20, 72);
    doc.text(`Due Date: ${new Date(record.due_date).toLocaleDateString("en-IN")}`, 20, 79);

    // Student Details Box
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.text(record.student_name, 20, 102);
    doc.text(`Student ID: ${record.student_id}`, 20, 109);
    doc.text(`Email: ${record.student_email}`, 20, 116);

    // Invoice Table
    autoTable(doc, {
      startY: 130,
      head: [["Description", "Period", "Amount (₹)"]],
      body: [
        [
          record.course_name,
          `${new Date(record.period_start).toLocaleDateString("en-IN")} - ${new Date(
            record.period_end
          ).toLocaleDateString("en-IN")}`,
          record.amount.toLocaleString("en-IN"),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 130, finalY + 15);
    doc.text(`₹${record.amount.toLocaleString("en-IN")}`, 180, finalY + 15, {
      align: "right",
    });

    const gst = record.amount * 0.18;
    doc.setFont("helvetica", "normal");
    doc.text("GST (18%):", 130, finalY + 22);
    doc.text(`₹${gst.toLocaleString("en-IN")}`, 180, finalY + 22, {
      align: "right",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 130, finalY + 32);
    doc.text(
      `₹${(record.amount + gst).toLocaleString("en-IN")}`,
      180,
      finalY + 32,
      { align: "right" }
    );

    // Payment Status
    if (record.status === "PAID") {
      doc.setFillColor(16, 185, 129);
      doc.rect(20, finalY + 45, 170, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(
        `PAID - Payment received on ${new Date(
          record.paid_date!
        ).toLocaleDateString("en-IN")}`,
        105,
        finalY + 52,
        { align: "center" }
      );
      doc.setTextColor(0, 0, 0);
    }

    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for your payment. For queries, contact: support@acadify.com",
      105,
      280,
      { align: "center" }
    );

    // Terms
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Terms & Conditions:", 20, 270);
    doc.text("1. Payment is due within 15 days of invoice date.", 20, 275);
    doc.text(
      "2. Late payments may incur additional charges as per institute policy.",
      20,
      280
    );

    if (action === "download") {
      doc.save(`Invoice_${record.invoice_number}.pdf`);
      toast.success("Invoice downloaded successfully");
    } else {
      window.open(doc.output("bloburl"), "_blank");
    }
  };

  export default generateInvoicePDF;