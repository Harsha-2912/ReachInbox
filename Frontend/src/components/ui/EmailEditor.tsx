import { useRef, useState } from 'react';
import { Bold, Italic, Link2, List } from 'lucide-react';

interface EmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EmailEditor({ value, onChange, placeholder }: EmailEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [active, setActive] = useState({ bold: false, italic: false, ul: false, link: false });

  const applyFormat = (format: 'bold' | 'italic' | 'ul' | 'link') => {
    const textarea = ref.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selected || 'text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'text'}*`;
        break;
      case 'ul':
        replacement = selected
          ? selected.split('\n').map(l => `- ${l}`).join('\n')
          : '- List item';
        break;
      case 'link':
        replacement = `[${selected || 'link text'}](https://)`;
        break;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
    setActive(prev => ({ ...prev, [format]: !prev[format] }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  const tools = [
    { icon: Bold, format: 'bold' as const, label: 'Bold' },
    { icon: Italic, format: 'italic' as const, label: 'Italic' },
    { icon: Link2, format: 'link' as const, label: 'Link' },
    { icon: List, format: 'ul' as const, label: 'List' },
  ];

  return (
    <div className="border border-ink-200 rounded-xl overflow-hidden focus-within:border-ink-900 focus-within:ring-2 focus-within:ring-ink-900/5 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-ink-200 bg-ink-50/50">
        {tools.map((tool) => (
          <button
            key={tool.format}
            type="button"
            onClick={() => applyFormat(tool.format)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              active[tool.format] ? 'bg-ink-100 text-ink-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
            }`}
            aria-label={tool.label}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-[14px] text-ink-900 bg-white resize-y min-h-[200px] placeholder:text-ink-500"
      />
    </div>
  );
}
