export const handlePrintQuotation = (quotation, calculateSubtotal, calculateTax, calculateTotal) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    toast.error("Pop-up blocked. Please allow pop-ups for this site.");
    return;
  }

  const formattedDate = new Date(quotation.date).toLocaleDateString();

  const calculateDiscountPrice = (item) => {
    if (item.discount) {
      return item.price - (item.price * item.discount / 100);
    }
    return item.price;
  };

  const hasAnyDiscount = quotation.items.some(item => item.discount && item.discount > 0);
  const showGstColumn = !quotation.includeGst && quotation.items.some(item => item.gst && item.gst > 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Quotation #${quotation.quotationId}</title>
      <style>
        @page {
          size: A5 portrait;
          margin: 15mm 10mm;
        }

        body {
          font-family: Arial, 'Helvetica Neue', sans-serif;
          color: #000;
          background-color: white;
          margin: 0;
          padding: 0;
          line-height: 1.3;
        }

        .container {
          width: 100%;
          max-width: 100%;
          padding: 5px 10px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000;
        }

        .header-left h1 {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 5px 0;
          letter-spacing: 0.5px;
        }

        .quotation-id {
          font-size: 16px;
          font-weight: 700;
        }

        .date-info {
          font-size: 14px;
          color: #000;
        }

        .bill-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #555;
        }

        .bill-section h2 {
          font-size: 16px;
          margin: 0 0 5px 0;
          font-weight: 700;
        }

        .customer-name {
          font-weight: 600;
          font-size: 15px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          font-size: 14px;
        }

        th {
          padding: 8px 6px;
          border-bottom: 1.5px solid #000;
          text-align: left;
          background-color: #f0f0f0;
          font-weight: 700;
        }

        td {
          padding: 0px 2px;
          border-bottom: 1px solid #888;
          text-align: left;
        }

        tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .item-name {
          font-weight: 600;
        }

        .item-sku {
          font-size: 12px;
          color: #444;
          padding-top: 3px;
        }

        .totals {
          display: flex;
          justify-content: flex-end;
        }

        .totals-table {
          width: 270px;
          border: 1px solid #ccc;
          padding: 8px;
          background-color: #f9f9f9;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }

        .total-divider {
          border-top: 1px solid #888;
          margin: 6px 0;
        }

        .grand-total {
          font-weight: bold;
          font-size: 16px;
        }

        .footer {
          margin-top: 25px;
          text-align: center;
          font-size: 12px;
          color: #444;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }

        @media print {
          .no-print {
            display: none;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        .print-button {
          margin: 10px auto;
          padding: 8px 16px;
          font-size: 14px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center;">
        <button class="print-button" onclick="window.print(); return false;">Print or Save as PDF</button>
      </div>

      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1>QUOTATION</h1>
            <div class="date-info">${formattedDate}</div>
          </div>
          <div class="header-right">
            <div class="quotation-id">#${quotation.quotationId}</div>
          </div>
        </div>

        <div class="bill-details">
          <div class="bill-section">
            <h2>Quotation To:</h2>
            <div class="customer-name">${quotation.customerName}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%">Item</th>
              <th class="text-center" style="width: 10%">Qty</th>
              <th class="text-right" style="width: 20%">Price/Unit</th>
              ${showGstColumn ? '<th class="text-center" style="width: 10%">GST</th>' : ''}
              <th class="text-right" style="width: 20%">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map(item => {
              const discountedUnitPrice = calculateDiscountPrice(item);
              const discountAmount = item.discount ? (item.price * item.quantity * item.discount) / 100 : 0;
              const itemTotalBeforeGst = item.price * item.quantity - discountAmount;
              const gstAmount = !quotation.includeGst ? (itemTotalBeforeGst * (item.gst || 0)) / 100 : 0;
              const itemTotal = quotation.includeGst ? itemTotalBeforeGst : itemTotalBeforeGst + gstAmount;

              return `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                    <div class="item-sku">${Array.isArray(item.sku) ? item.sku.join(", ") : (item.sku || 'N/A')}</div>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${discountedUnitPrice.toFixed(2)}</td>
                  ${showGstColumn ? `<td class="text-center">${item.gst || 0}%</td>` : ''}
                  <td class="text-right">₹${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-table">
            <div class="totals-row">
              <span><strong>Subtotal:</strong></span>
              <span>₹${calculateSubtotal().toFixed(2)}</span>
            </div>

            ${!quotation.includeGst && calculateTax() > 0 ? `
              <div class="totals-row">
                <span><strong>GST:</strong></span>
                <span>₹${calculateTax().toFixed(2)}</span>
              </div>
            ` : ''}

            ${quotation.extraCharge > 0 ? `
              <div class="totals-row">
                <span><strong>Extra (${quotation.extraChargeDescription}):</strong></span>
                <span>₹${quotation.extraCharge.toFixed(2)}</span>
              </div>
            ` : ''}

            <div class="total-divider"></div>
            <div class="totals-row grand-total">
              <span>Total:</span>
              <span>₹${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
};