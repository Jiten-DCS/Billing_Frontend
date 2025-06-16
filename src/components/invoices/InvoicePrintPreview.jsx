const InvoicePrintPreview = ({ invoice, formatDate }) => {

  const getCustomerDetails = (invoice) => {
    if (typeof invoice.customer === "object" && invoice.customer !== null) {
      return {
        name: invoice.customer.name || invoice.customerName || "N/A",
        email: invoice.customer.email || "",
        phone: invoice.customer.phone || "",
      };
    }
    return {
      name: invoice.customerName || "N/A",
      email: "",
      phone: "",
    };
  };

  const calculateDiscountPrice = (item) => {
    // Apply discount to the price
    const discountedPrice = item.discount
      ? item.price - (item.price * item.discount) / 100
      : item.price;

    // If includeGst is true, add GST to the discounted price
    if (invoice.includeGst) {
      return discountedPrice + (discountedPrice * (item.gst || 0)) / 100;
    }

    return discountedPrice;
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.price;

      const discountAmount = (item.discount / 100) * itemTotal;
      const discountedPrice = itemTotal - discountAmount;

      const gstAmount = (item.gst / 100) * discountedPrice;

      return total + discountedPrice + gstAmount;
    }, 0);
  };

  const hasAnyDiscount = invoice.items.some(
    (item) => item.discount && item.discount > 0
  );

  const showGstColumn =
    !invoice.includeGst &&
    invoice.items.some((item) => item.gst && item.gst > 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Invoice ${invoice.invoiceId || invoice._id}</title>
      <style>
        @page {
          size: A5;
          margin: 10mm;
        }
        
        body {
          font-family: Arial, 'Helvetica Neue', sans-serif;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
          background-color: white;
        }
        
        .container {
          width: 100%;
          max-width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #000;
        }
        
        .header-left h1 {
          font-size: 22px;
          font-weight: bold;
          margin: 0 0 5px 0;
          letter-spacing: 0.5px;
        }
        
        .header-right {
          text-align: right;
        }
        
        .invoice-id {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 3px;
        }
        
        .status-paid {
          background-color: #c6f6d5;
          color: #03543e;
          border: 1px solid #03543e;
        }
        
        .status-pending {
          background-color: #feebc8;
          color: #92400e;
          border: 1px solid #92400e;
        }
        
        .status-overdue {
          background-color: #fed7d7;
          color: #9b1c1c;
          border: 1px solid #9b1c1c;
        }
        
        .status-unpaid {
          background-color: #fed7d7;
          color: #9b1c1c;
          border: 1px solid #9b1c1c;
        }
        
        .bill-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #555;
        }
        
        .bill-section h2 {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          margin: 0 0 6px 0;
        }
        
        .bill-info {
          font-size: 14px;
          line-height: 1.5;
        }
        
        .customer-name {
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .customer-contact {
          color: #333;
        }
        
        .date-info {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 1px solid #999;
        }
        
        th {
          background-color: #f0f0f0;
          text-align: left;
          padding: 6px 4px;
          font-weight: 700;
          font-size: 12px;
          color: #000;
          border-bottom: 1.5px solid #000;
          border-right: 1px solid #ccc;
        }
        
        th:last-child {
          border-right: none;
        }
        
        td {
          padding: 0px 2px;
          margin-top:2px;
          border-right: 1px solid #ccc;
          font-size: 12px;
        }
        
        td:last-child {
          border-right: none;
        }
        
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .item-name {
          font-weight: 600;
        }
        
        .item-sku {
          color: #444;
          font-size: 12px;
          margin-top: 3px;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
        }
        
        .totals-table {
          width: 280px;
          border: 1px solid #999;
          padding: 2px;
          background-color: #f9f9f9;
        }
        
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          font-size: 12px;
        }
        
        .totals-label {
          color: #333;
          font-weight: 500;
        }
        
        .total-divider {
          border-top: 1px solid #777;
          margin: 4px 0;
        }
        
        .grand-total {
          font-weight: bold;
          font-size: 14px;
        }
        
        .footer {
          margin-top: 10px;
          text-align: center;
          color: #333;
          font-size: 12px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background-color: white;
          }

          .container {
            width: 100%;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }

          .totals-table {
            border: 1px solid #999;
          }
          
          tr, td, th {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1>Estimate</h1>
            <div class="date-info">
              ${formatDate(invoice.date)} • 
              ${new Date(invoice.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div class="header-right">
           <div class="invoice-id">
           ${invoice.invoiceId.replace(/^#?(INV|EST)-/, "")}
           </div>

            <div class="status status-${invoice.status?.toLowerCase()}">
              ${invoice.status}
            </div>
          </div>
        </div>

        <div class="bill-details">
          <div class="bill-section">
            <h2>Estimate To:</h2>
            <div class="bill-info">
              <div class="customer-name">${
                getCustomerDetails(invoice).name
              }</div>
              ${
                getCustomerDetails(invoice).email
                  ? `<div class="customer-contact">${
                      getCustomerDetails(invoice).email
                    }</div>`
                  : ""
              }
              ${
                getCustomerDetails(invoice).phone
                  ? `<div class="customer-contact">${
                      getCustomerDetails(invoice).phone
                    }</div>`
                  : ""
              }
            </div>
          </div>
          <div class="bill-section">
            <h2>Payment Details:</h2>
            <div class="bill-info">
              <div><strong>Date:</strong> ${formatDate(
                invoice.dueDate || invoice.date
              )}</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%">Item</th>
              <th class="text-center" style="width: 10%">Qty</th>
             
              <th class="text-center" style="width: 15%">Price/Unit</th>
              ${
                showGstColumn
                  ? '<th class="text-center" style="width: 10%">GST</th>'
                  : ""
              }
              <th class="text-right" style="width: 15%">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map((item) => {
                const discountedUnitPrice = calculateDiscountPrice(item);
                const discountAmount = item.discount
                  ? (item.price * item.quantity * item.discount) / 100
                  : 0;
                const itemTotalBeforeGst =
                  item.price * item.quantity - discountAmount;
                const gstAmount = (itemTotalBeforeGst * (item.gst || 0)) / 100;

                // Calculate the item total based on includeGst setting
                const itemTotal = invoice.includeGst
                  ? itemTotalBeforeGst + gstAmount
                  : itemTotalBeforeGst + (invoice.includeGst ? 0 : gstAmount);

                return `
                <tr>
                  <td>
                    <div class="item-name">${item.name}</div>
                  </td>
                  <td class="text-center">${item.quantity} ${
                  item.sku || "pc"
                }</td>
                  <td class="text-center">₹${discountedUnitPrice.toFixed(
                    2
                  )}</td>
                  ${
                    showGstColumn
                      ? `<td class="text-center">${item.gst || 0}%</td>`
                      : ""
                  }
                  <td class="text-right">₹${itemTotal.toFixed(2)}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-table">
            <div class="totals-row">
              <span class="totals-label">Subtotal:</span>
              <span>₹${calculateSubtotal().toFixed(2)}</span>
            </div>

            ${
              !invoice.includeGst && invoice.tax && invoice.tax > 0
                ? `<div class="totals-row">
                  <span class="totals-label">GST:</span>
                  <span>₹${invoice.tax.toFixed(2)}</span>
                </div>`
                : ""
            }

            ${
              invoice.discount && invoice.discount > 0
                ? `<div class="totals-row">
                    <span class="totals-label">Discount:</span>
                    <span>-₹${invoice.discount.toFixed(2)}</span>
                  </div>`
                : ""
            }

            ${
              invoice?.extraCharge > 0
                ? `<div class="total-divider"></div>
                   <div class="totals-row">
                     <span class="totals-label">Extra${
                       invoice.extraChargeDescription
                         ? ` (${invoice.extraChargeDescription})`
                         : ""
                     }:</span>
                     <span>₹${invoice.extraCharge?.toFixed(2) || "0.00"}</span>
                   </div>`
                : ""
            }

            <div class="total-divider"></div>
            <div class="totals-row grand-total">
              <span>Total:</span>
              <span>₹${invoice.total.toFixed(2)}</span>
            </div>

             ${
               invoice?.status === "Partial"  ?
               `
                        <div class="totals-row grand-total" >
                          <span>Paid:</span>
                          <span>₹${invoice.partialPayAmount.toFixed(2)}</span>
                        </div>
                        <div class="totals-row grand-total">
                          <span>Due:</span>
                          <span>₹${invoice.duePayment.toFixed(2)}</span>
                        </div>
                    `:``
             }

          </div>
        </div>

       
      </div>

      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
            // Add event listener to close window after print
            window.addEventListener('afterprint', function() {
              window.close();
            });
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
};

export default InvoicePrintPreview;
