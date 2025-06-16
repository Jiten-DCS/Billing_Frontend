import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ExportButton = ({ onExport, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (removeAfterExport) => {
    setIsLoading(true);
    try {
      await onExport(removeAfterExport);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1.5 text-sm h-8"
          disabled={disabled || isLoading}
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport(false)}>
          <Download className="mr-2 h-4 w-4" />
          <span>Export Products</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            if (window.confirm('This will export AND DELETE all products. Continue?')) {
              handleExport(true);
            }
          }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Export & Clear Inventory</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;