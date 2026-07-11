import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui';

export default function QRTag({ url, code, label }: { url: string; code: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = ref.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${code}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div ref={ref} className="rounded-md border border-graphite-600 bg-white p-3">
        <QRCodeCanvas value={url} size={160} />
      </div>
      <div>
        <p className="font-mono text-sm text-amber-500">{code}</p>
        <p className="text-xs text-steel-300">{label}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="secondary" onClick={download}><Download size={14} /> Download</Button>
        <Button variant="secondary" onClick={copyLink}><Copy size={14} /> Copy link</Button>
        <a href={url} target="_blank" rel="noreferrer">
          <Button variant="ghost"><ExternalLink size={14} /> Open public page</Button>
        </a>
      </div>
    </div>
  );
}
