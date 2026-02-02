import PDFDocument from "pdfkit";
import fs from "fs";

export const generateReceipt = (transaction, student, batch) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });

       
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData); 
        });

        doc.fillColor("#444444")
           .fontSize(20)
           .text("SOLVIFY COACHING", 50, 57) 
           .fontSize(10)
           .text("123, Tech Park, Nagpur", 200, 65, { align: "right" })
           .text("support@solvify.io", 200, 80, { align: "right" })
           .moveDown();

        doc.text(`Receipt No: ${transaction.transactionId}`, 50, 200)
           .text(`Date: ${new Date().toDateString()}`, 50, 215)
           .text(`Student: ${student.fullName}`, 300, 200)
           .text(`Batch: ${batch.name}`, 300, 215)
           .moveDown();

        const tableTop = 330;
        doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, tableTop).lineTo(550, tableTop).stroke();
        
        doc.font("Helvetica-Bold")
           .text("Description", 50, tableTop + 5)
           .text("Amount", 450, tableTop + 5, { align: "right" });

        doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, tableTop + 25).lineTo(550, tableTop + 25).stroke();

     
        doc.font("Helvetica")
           .text("Fee Installment Payment", 50, tableTop + 35)
           .text(`Rs. ${transaction.amount}/-`, 450, tableTop + 35, { align: "right" });

           
        doc.fontSize(10)
           .text(
               "Thank you for your payment. This is a computer-generated receipt.",
               50,
               700,
               { align: "center", width: 500 }
           );

        doc.end();
    });
};