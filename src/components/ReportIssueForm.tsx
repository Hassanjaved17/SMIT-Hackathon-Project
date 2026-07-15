import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Sparkles, Loader2, CheckCircle2, Paperclip, X } from 'lucide-react';
import { Button, Field, PriorityBadge, inputClass } from './ui';
import { createIssue, listIssues } from '../lib/store';
import { runTriage } from '../lib/aiTriage';
import { uploadEvidence, EvidenceUploadError } from '../lib/evidence';
import IssueReceipt from './IssueReceipt';
import type { Asset, AITriageResult, Priority, Issue } from '../types';

export default function ReportIssueForm({ asset, onSubmitted }: { asset: Asset; onSubmitted?: (issueNumber: string) => void }) {
  const [complaint, setComplaint] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  const [aiResult, setAiResult] = useState<AITriageResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiTouched, setAiTouched] = useState({ title: false, category: false, priority: false });

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');

  const [submitting, setSubmitting] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  function handleEvidenceChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEvidenceError(null);
    setEvidenceFile(file);
    setEvidencePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearEvidence() {
    setEvidenceFile(null);
    setEvidencePreview(null);
    setEvidenceError(null);
  }

  async function handleRunAI() {
    setAiError(null);
    setAiLoading(true);
    try {
      const existingIssues = await listIssues(asset.id);
      const result = await runTriage(complaint, {
        name: asset.name,
        category: asset.category,
        recentIssueCount: existingIssues.length,
      });
      setAiResult(result);
      setTitle(result.title);
      setCategory(result.category);
      setPriority(result.priority);
      setAiTouched({ title: false, category: false, priority: false });
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!complaint.trim() || !reporterName.trim()) {
      setError('Please describe the issue and provide your name.');
      return;
    }
    setSubmitting(true);
    try {
      let evidence_url: string | null = null;
      if (evidenceFile) {
        try {
          evidence_url = await uploadEvidence(evidenceFile, 'issues');
        } catch (err) {
          const message = err instanceof EvidenceUploadError ? err.message : 'Evidence upload failed.';
          setEvidenceError(message);
          setSubmitting(false);
          return;
        }
      }

      const finalTitle = title.trim() || complaint.trim().slice(0, 60);
      const issue = await createIssue({
        asset_id: asset.id,
        title: finalTitle,
        description: complaint.trim(),
        category: category || 'General',
        priority,
        reporter_name: reporterName.trim(),
        reporter_contact: reporterContact.trim() || null,
        assigned_technician: null,
        ai_suggested_title: !!aiResult && !aiTouched.title,
        ai_suggested_category: !!aiResult && !aiTouched.category,
        ai_suggested_priority: !!aiResult && !aiTouched.priority,
        ai_possible_causes: aiResult?.possible_causes ?? [],
        ai_initial_checks: aiResult?.initial_checks ?? [],
        evidence_url,
      });
      setSubmittedIssue(issue);
      onSubmitted?.(issue.issue_number);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedIssue) {
    return (
      <div>
        <div className="mb-5 rounded-md border border-teal-500/30 bg-teal-500/10 p-4 text-center">
          <CheckCircle2 size={24} className="mx-auto mb-2 text-teal-400" />
          <h3 className="font-display text-base font-semibold text-mist-100">Issue reported</h3>
          <p className="mt-1 text-xs text-steel-300">
            Save or print your receipt below — keep it as evidence and to track this issue later.
          </p>
        </div>
        <IssueReceipt issue={submittedIssue} asset={asset} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Describe the problem">
        <textarea
          className={`${inputClass} min-h-[100px]`}
          placeholder='e.g. "The projector display is flickering and sometimes does not detect HDMI."'
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        />
      </Field>

      <Button variant="secondary" type="button" onClick={handleRunAI} disabled={aiLoading || !complaint.trim()}>
        {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} className="text-amber-500" />}
        {aiLoading ? 'Running AI triage…' : 'Run AI issue triage'}
      </Button>
      {aiError && <p className="text-sm text-danger-500">{aiError} You can still fill in the fields manually below.</p>}

      {(aiResult || title) && (
        <div className="space-y-4 rounded-md border border-graphite-700 bg-graphite-800/60 p-4">
          {aiResult && (
            <p className="flex items-center gap-1.5 text-xs text-amber-500">
              <Sparkles size={13} /> AI-suggested — review and edit before submitting
            </p>
          )}
          <Field label="Issue title">
            <input className={inputClass} value={title} onChange={(e) => { setTitle(e.target.value); setAiTouched((t) => ({ ...t, title: true })); }} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input className={inputClass} value={category} onChange={(e) => { setCategory(e.target.value); setAiTouched((t) => ({ ...t, category: true })); }} />
            </Field>
            <Field label="Priority">
              <select
                className={inputClass}
                value={priority}
                onChange={(e) => { setPriority(e.target.value as Priority); setAiTouched((t) => ({ ...t, priority: true })); }}
              >
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-2"><PriorityBadge priority={priority} /></div>

          {aiResult && aiResult.possible_causes.length > 0 && (
            <div className="text-xs text-steel-300">
              <p className="mb-1 font-semibold text-steel-200">Possible causes</p>
              <ul className="list-inside list-disc space-y-0.5">
                {aiResult.possible_causes.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          )}
          {aiResult && aiResult.initial_checks.length > 0 && (
            <div className="text-xs text-steel-300">
              <p className="mb-1 font-semibold text-steel-200">Safe initial checks</p>
              <ul className="list-inside list-disc space-y-0.5">
                {aiResult.initial_checks.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <p className="mt-2 text-amber-500">For anything electrical, mechanical, or safety-related, a qualified technician should confirm before use.</p>
            </div>
          )}
          {aiResult?.recurring_pattern_warning && (
            <p className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-500">{aiResult.recurring_pattern_warning}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Your name">
          <input className={inputClass} value={reporterName} onChange={(e) => setReporterName(e.target.value)} required />
        </Field>
        <Field label="Contact (optional)">
          <input className={inputClass} value={reporterContact} onChange={(e) => setReporterContact(e.target.value)} placeholder="Phone or email" />
        </Field>
      </div>

      <Field label="Photo evidence (optional)">
        {evidencePreview ? (
          <div className="flex items-center gap-3">
            <img src={evidencePreview} alt="Evidence preview" className="h-16 w-16 rounded-md border border-graphite-700 object-cover" />
            <Button variant="secondary" type="button" onClick={clearEvidence}><X size={14} /> Remove</Button>
          </div>
        ) : (
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-graphite-600 px-3 py-2 text-sm text-steel-300 hover:border-amber-500/50">
            <Paperclip size={14} />
            Attach a photo
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleEvidenceChange} />
          </label>
        )}
        {evidenceError && <p className="mt-1 text-xs text-danger-500">{evidenceError}</p>}
      </Field>

      {error && <p className="text-sm text-danger-500">{error}</p>}

      <Button type="submit" variant="primary" disabled={submitting} className="w-full">
        {submitting ? 'Submitting…' : 'Submit issue report'}
      </Button>
    </form>
  );
}