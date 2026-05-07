const PDFDocument = require('pdfkit');
const Submission = require('../models/Submission');

const downloadReportPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const submission = await Submission.findOne({ _id: id, userId });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=proofnexa-report-${submission._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    // Watermark first!
    doc.save();
    doc.opacity(0.06);
    doc.fontSize(56)
      .fillColor("#7c3aed")
      .rotate(-45, { origin: [300, 420] })
      .text("ProofNexa Report", 100, 450, { align: "center" });
    doc.restore();

    // Reset opacity and color for normal text
    doc.opacity(1);
    doc.fillColor("#111827");

    // Actual Content
    let y = 50;

    doc.fontSize(26).fillColor("#111827").text("ProofNexa", 40, y);
    y += 40;

    doc.fontSize(18).fillColor("#4B5563").text("Plagiarism Scan Report", 40, y);
    y += 55;

    // Function to generate text title
    const generateTextTitle = (text) => {
      if (!text) return "Unknown Source";
      const clean = text.replace(/\s+/g, " ").trim();
      const words = clean.split(" ");
      const maxWords = 12;
      return words.length > 0 ? `${words.slice(0, maxWords).join(" ")}${words.length > maxWords ? "..." : ""}` : "Unknown Source";
    };

    let displayTitle = submission.fileName || "Untitled Document";
    if (displayTitle === "Raw Text Scan" || !displayTitle) {
      displayTitle = generateTextTitle(submission.originalText || submission.content || "");
    }

    doc.fontSize(15).fillColor("#111827").font('Helvetica-Bold').text("Document:", 40, y, { continued: true }).font('Helvetica').text(` ${displayTitle}`);
    y += 30;

    doc.font('Helvetica-Bold').text("Status:", 40, y, { continued: true }).font('Helvetica').text(` ${submission.status || "N/A"}`);
    y += 30;

    const similarity = submission.similarityScore ?? 0;
    
    // Risk Level Logic
    let riskLevel = "Low";
    let riskColor = "#10B981"; // Emerald
    if (similarity > 70) {
      riskLevel = "High";
      riskColor = "#EF4444"; // Red
    } else if (similarity > 30) {
      riskLevel = "Medium";
      riskColor = "#F59E0B"; // Yellow/Amber
    }

    doc.font('Helvetica-Bold').text("Similarity:", 40, y, { continued: true }).font('Helvetica').text(` ${similarity}%`);
    y += 30;
    
    doc.font('Helvetica-Bold').text("Risk Level: ", 40, y, { continued: true }).fillColor(riskColor).text(riskLevel).fillColor("#111827");
    y += 30;

    const dateStr = new Date(submission.createdAt).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    doc.font('Helvetica-Bold').text("Date Scanned:", 40, y, { continued: true }).font('Helvetica').text(` ${dateStr}`);
    y += 55;

    doc.fontSize(18).fillColor("#4C1D95").font('Helvetica-Bold').text("Analysis Summary", 40, y);
    y += 30;

    doc.fontSize(13).fillColor("#374151").font('Helvetica').text(
      submission.analysisSummary || "Analysis completed successfully.",
      40,
      y,
      { width: 515, lineGap: 6 }
    );

    y += 95;
    doc.fontSize(18).fillColor("#4C1D95").font('Helvetica-Bold').text("Top Matched Sources", 40, y);
    y += 35;

    let matches = Array.isArray(submission.matches)
      ? submission.matches.filter((m) => m && Object.keys(m).length > 0)
      : [];
      
    matches = matches.slice(0, 10); // Enforce top 10 limit visually

    const getMatchSnippet = (match) =>
      match.matchedText ||
      match.text ||
      match.snippet ||
      match.content ||
      match.excerpt ||
      "No matched text snippet available.";

    const getMatchTitle = (match, index) => {
      let title = match.source || match.title || match.fileName || match.sourceName || match.documentName || match.url || `Matched Source ${index + 1}`;
      if (title === "Raw Text Scan" || title.includes("Raw Text Scan")) {
        title = generateTextTitle(getMatchSnippet(match));
      } else {
        // Enforce 12 words limit even for filenames to prevent overflow
        title = generateTextTitle(title);
      }
      return title;
    };

    const getMatchScore = (match) =>
      match.similarityScore ??
      match.similarity ??
      match.score ??
      match.percentage ??
      0;

    if (matches.length === 0) {
      doc.fontSize(14).fillColor("#6B7280").font('Helvetica-Oblique').text("No matched sources found.", 40, y);
    } else {
      matches.forEach((match, index) => {
        const titleText = `${index + 1}. ${getMatchTitle(match, index)}`;
        const scoreText = `${getMatchScore(match)}%`;

        let snippet = getMatchSnippet(match);
        snippet = snippet.replace(/\s+/g, " ").trim();
        if (snippet.length > 250) {
           snippet = snippet.substring(0, 247) + "...";
        }
        snippet = `"...${snippet}..."`;

        // Calculate heights dynamically
        doc.fontSize(15).font('Helvetica-Bold');
        let actualTitleHeight = doc.heightOfString(titleText, { width: 395 });
        // Enforce max 2 lines (approx 36 pts)
        if (actualTitleHeight > 40) actualTitleHeight = 36;

        doc.fontSize(11).font('Helvetica');
        let actualPreviewHeight = doc.heightOfString(snippet, { width: 485, lineGap: 5 });
        // Enforce max 2 lines (approx 32 pts)
        if (actualPreviewHeight > 35) actualPreviewHeight = 32;

        const paddingTop = 16;
        const paddingBottom = 16;
        const titleMarginBottom = 8;
        const cardHeight = paddingTop + actualTitleHeight + titleMarginBottom + actualPreviewHeight + paddingBottom;

        // Ensure page break
        if (y + cardHeight + 20 > 740) {
          doc.addPage();
          y = 50;
        }

        // Draw Card Background
        doc
          .roundedRect(40, y, 515, cardHeight, 8)
          .fill("#F5F3FF");

        // Draw Score aligned to the right (Top-Right of card)
        doc
          .fillColor("#4C1D95")
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(scoreText, 450, y + paddingTop, { width: 90, align: "right" });

        // Draw Title (Max 2 lines)
        doc
          .fillColor("#4C1D95")
          .fontSize(15)
          .font('Helvetica-Bold')
          .text(titleText, 55, y + paddingTop, {
            width: 395,
            height: 38,
            ellipsis: true
          });

        // Draw Preview Text (Max 2 lines)
        doc
          .fillColor("#4B5563")
          .fontSize(11)
          .font('Helvetica')
          .text(snippet, 55, y + paddingTop + actualTitleHeight + titleMarginBottom, {
            width: 485,
            lineGap: 5,
            height: 34, // limit to 2 lines height visually
            ellipsis: true
          });

        // Add margin-bottom between cards
        y += cardHeight + 20;
      });
    }

    // Footer
    doc.fontSize(10)
      .fillColor("#9CA3AF")
      .font('Helvetica')
      .text(`Generated by ProofNexa AI Plagiarism Engine on ${new Date().toLocaleDateString()}`, 40, 780, {
        align: "center",
        width: 515,
      });

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
  }
};

module.exports = { downloadReportPdf };
