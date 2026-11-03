import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from './Button';
import {
  importSheetData,
  parseQuestionCSV,
  parseQuestionJSON,
  getSampleTemplate,
  clearSheetQuestions,
} from '../../services/importer';
import type { ImportSummary } from '../../types';

interface SheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSheetId?: string;
  onImportComplete?: (summary: ImportSummary) => void;
}

export function SheetImportModal({
  isOpen,
  onClose,
  defaultSheetId = 'love-babbar-450',
  onImportComplete,
}: SheetImportModalProps) {
  const [selectedSheet, setSelectedSheet] = useState(defaultSheetId);
  const [activeTab, setActiveTab] = useState<'upload' | 'template'>('upload');
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [rawText, setRawText] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sheetOptions = [
    { id: 'love-babbar-450', name: 'Love Babbar 450' },
    { id: 'apna-college', name: 'Apna College' },
    { id: 'custom-sheet', name: 'Custom Collection' },
  ];

  const currentSheetName =
    sheetOptions.find((s) => s.id === selectedSheet)?.name || 'Custom Collection';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isJson = file.name.endsWith('.json');
    setFileType(isJson ? 'json' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setSummary(null);

    try {
      const { records, errors } =
        fileType === 'csv'
          ? parseQuestionCSV(rawText)
          : parseQuestionJSON(rawText);

      if (records.length === 0) {
        setSummary({
          sheetId: selectedSheet,
          sheetName: currentSheetName,
          totalProcessed: 0,
          newlyImported: 0,
          matchedExisting: 0,
          skipped: 0,
          rejected: 0,
          errors: errors.length > 0 ? errors : ['No valid records found to import.'],
        });
        setIsProcessing(false);
        return;
      }

      const res = importSheetData(selectedSheet, currentSheetName, records);
      if (errors.length > 0) {
        res.errors.push(...errors);
      }
      setSummary(res);
      onImportComplete?.(res);
    } catch (err) {
      setSummary({
        sheetId: selectedSheet,
        sheetName: currentSheetName,
        totalProcessed: 0,
        newlyImported: 0,
        matchedExisting: 0,
        skipped: 0,
        rejected: 0,
        errors: [(err as Error).message || 'Failed to process import.'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyTemplate = () => {
    const tpl = getSampleTemplate(fileType, currentSheetName);
    navigator.clipboard.writeText(tpl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const tpl = getSampleTemplate(fileType, currentSheetName);
    const blob = new Blob([tpl], {
      type: fileType === 'csv' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSheet}-template.${fileType}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSheet = () => {
    if (window.confirm(`Are you sure you want to clear custom questions for ${currentSheetName}?`)) {
      clearSheetQuestions(selectedSheet);
      setSummary(null);
      setRawText('');
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-sidebar/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-pink/10 text-accent-pink border border-accent-pink/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Import Question Collection</h2>
              <p className="text-xs text-secondary">
                Bulk import DSA questions into CodeTrack with automatic deduplication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Sheet Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
              Select Target Collection
            </label>
            <div className="grid grid-cols-3 gap-2">
              {sheetOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedSheet(opt.id);
                    setSummary(null);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedSheet === opt.id
                      ? 'bg-accent-yellow/10 border-accent-yellow text-primary font-medium'
                      : 'border-border/60 bg-surface-subtle/50 text-secondary hover:border-border hover:text-primary'
                  }`}
                >
                  <p className="text-sm font-semibold truncate">{opt.name}</p>
                  <p className="text-[11px] text-muted truncate">
                    {opt.id === 'custom-sheet' ? 'User-defined' : 'Curated list'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'upload'
                  ? 'bg-accent-pink text-white font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Upload or Paste Data
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'template'
                  ? 'bg-accent-pink text-white font-semibold'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Format Templates
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* File Type & File picker */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-secondary">Format:</span>
                  <div className="inline-flex rounded-md border border-border p-0.5 bg-surface-subtle">
                    <button
                      onClick={() => setFileType('csv')}
                      className={`px-2.5 py-0.5 text-xs rounded font-medium transition-colors ${
                        fileType === 'csv'
                          ? 'bg-card text-primary shadow-xs'
                          : 'text-muted hover:text-secondary'
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => setFileType('json')}
                      className={`px-2.5 py-0.5 text-xs rounded font-medium transition-colors ${
                        fileType === 'json'
                          ? 'bg-card text-primary shadow-xs'
                          : 'text-muted hover:text-secondary'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Choose File
                  </Button>
                </div>
              </div>

              {/* Paste Textarea */}
              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={
                    fileType === 'csv'
                      ? 'Paste CSV text here...\nTitle,Topic,Difficulty,Platform,ProblemUrl\nTwo Sum,Arrays,Easy,LeetCode,https://leetcode.com/problems/two-sum/'
                      : 'Paste JSON text here...\n[\n  { "title": "Two Sum", "topic": "Arrays", "difficulty": "Easy", "problemUrl": "https://leetcode.com/problems/two-sum/" }\n]'
                  }
                  rows={8}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-border bg-sidebar/50 text-primary placeholder-muted focus:outline-hidden focus:border-accent-yellow transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearSheet}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-400/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear {currentSheetName}
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleProcessImport}
                    disabled={!rawText.trim() || isProcessing}
                    className="min-w-28"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Import Records
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Results Summary Box */}
              {summary && (
                <div
                  className={`p-4 rounded-xl border ${
                    summary.errors.length > 0 && summary.newlyImported === 0 && summary.matchedExisting === 0
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-status-success/10 border-status-success/30'
                  } space-y-3 animate-in fade-in`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm flex items-center gap-2 text-primary">
                      {summary.errors.length > 0 && summary.newlyImported === 0 && summary.matchedExisting === 0 ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-status-success" />
                      )}
                      Import Results for {summary.sheetName}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      Processed {summary.totalProcessed} records
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-card/60 border border-border">
                      <p className="text-muted text-[10px] uppercase font-mono">New Added</p>
                      <p className="text-base font-bold text-accent-yellow">{summary.newlyImported}</p>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border">
                      <p className="text-muted text-[10px] uppercase font-mono">Matched</p>
                      <p className="text-base font-bold text-status-success">{summary.matchedExisting}</p>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border">
                      <p className="text-muted text-[10px] uppercase font-mono">Skipped</p>
                      <p className="text-base font-bold text-muted">{summary.skipped}</p>
                    </div>
                    <div className="p-2 rounded bg-card/60 border border-border">
                      <p className="text-muted text-[10px] uppercase font-mono">Rejected</p>
                      <p className="text-base font-bold text-rose-400">{summary.rejected}</p>
                    </div>
                  </div>

                  {summary.errors.length > 0 && (
                    <div className="mt-2 text-xs text-rose-300 bg-card/70 p-2.5 rounded border border-rose-500/20 max-h-32 overflow-y-auto space-y-1 font-mono">
                      {summary.errors.map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-4">
              <p className="text-xs text-secondary leading-relaxed">
                Use these verified templates to structure problem lists for Love Babbar 450, Apna College, or custom university DSA assignments.
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyTemplate}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Template'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {fileType.toUpperCase()}
                </Button>
              </div>

              <pre className="font-mono text-xs p-3.5 rounded-lg border border-border bg-sidebar text-primary overflow-x-auto max-h-64">
                {getSampleTemplate(fileType, currentSheetName)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
