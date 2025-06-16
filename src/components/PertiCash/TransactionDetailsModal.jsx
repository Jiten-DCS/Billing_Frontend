import { X } from "lucide-react";

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Paid To</p>
            <p className="text-base">{transaction.paidTo}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Paid For</p>
            <p className="text-base">
              {transaction.paidFor}
              {transaction.customPaidFor && ` (${transaction.customPaidFor})`}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Account</p>
            <p className="text-base">
              {transaction.account}
              {transaction.customAccount && ` (${transaction.customAccount})`}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p
              className={`text-xl font-bold ${
                transaction.type === "CREDIT"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ₹{transaction.amount?.toLocaleString()}
            </p>
          </div>

          {transaction.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-base">{transaction.notes}</p>
            </div>
          )}

          {transaction.reference && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reference</p>
              <p className="text-base">{transaction.reference}</p>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Created: {new Date(transaction.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
