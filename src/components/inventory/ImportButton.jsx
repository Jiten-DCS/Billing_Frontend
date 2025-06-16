import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ImportExportButtons = ({ onFileUpload, onExport }) => {
  const fileInputRef = useRef(null);
  
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
      e.target.value = ''; // Reset file input
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1.5 text-sm h-8"
        onClick={handleButtonClick}
      >
        <Upload className="h-3.5 w-3.5" />
        <span>Import</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1.5 text-sm h-8"
        onClick={() => onExport(true)} // Directly call export with delete
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export</span>
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ImportExportButtons;