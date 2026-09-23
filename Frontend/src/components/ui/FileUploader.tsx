import { useState, useRef, useCallback } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import type { LeadFile } from '@/types';

interface FileUploaderProps {
  onFileProcessed: (file: LeadFile) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FileUploader({ onFileProcessed }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<LeadFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let lines: string[] = [];

      if (file.name.endsWith('.csv')) {
        const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
        lines = parsed.data
          .flat()
          .map((s) => String(s).trim())
          .filter(Boolean);
      } else {
        lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
      }

      const seen = new Set<string>();
      const validEmails: string[] = [];
      let invalid = 0;
      let duplicates = 0;

      for (const line of lines) {
        const email = line.match(emailRegex)?.[0] || line;
        if (!emailRegex.test(email)) {
          invalid++;
          continue;
        }
        const lower = email.toLowerCase();
        if (seen.has(lower)) {
          duplicates++;
          continue;
        }
        seen.add(lower);
        validEmails.push(email);
      }

      const leadFile: LeadFile = {
        fileName: file.name,
        totalLines: lines.length,
        validEmails: validEmails.length,
        invalidEmails: invalid,
        duplicates,
        emails: validEmails,
      };

      setResult(leadFile);
      onFileProcessed(leadFile);
      setProcessing(false);

      if (validEmails.length === 0) {
        toast.error('CSV contains no valid email addresses');
      } else {
        toast.success(`${validEmails.length} valid email addresses detected`);
      }
    };
    reader.readAsText(file);
  }, [onFileProcessed]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      processFile(file);
    } else {
      toast.error('Please upload a .csv or .txt file');
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl2 p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-400 hover:bg-ink-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleSelect}
          className="hidden"
        />
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-ink-400 border-t-ink-900 rounded-full animate-spin" />
            </div>
            <p className="text-[13px] text-ink-600">Processing file...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center text-ink-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-ink-900">Drop CSV or TXT file here</p>
              <p className="text-[13px] text-ink-500 mt-0.5">or <span className="text-ink-900 font-medium underline">choose file</span></p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4 space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2.5 text-[13px]">
            <FileIcon className="w-4 h-4 text-ink-500 flex-shrink-0" />
            <span className="font-medium text-ink-900 truncate">{result.fileName}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-success">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{result.validEmails.toLocaleString()} valid email addresses detected</span>
          </div>
          {result.invalidEmails > 0 && (
            <div className="flex items-center gap-2.5 text-[13px] text-warning">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{result.invalidEmails} invalid</span>
            </div>
          )}
          {result.duplicates > 0 && (
            <div className="flex items-center gap-2.5 text-[13px] text-ink-600">
              <Copy className="w-4 h-4 flex-shrink-0" />
              <span>{result.duplicates} duplicates removed</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
