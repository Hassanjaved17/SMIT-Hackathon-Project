import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Edit, Paperclip, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getAsset,
  listIssues,
  listHistory,
  updateIssueStatus,
  assignTechnician,
  markOutOfService,
  createMaintenanceRecord,
  updateAssetServiceDates,
} from "../lib/store";
import {
  AssetStatusBadge,
  Button,
  Field,
  IssueStatusBadge,
  Plate,
  PriorityBadge,
  inputClass,
} from "../components/ui";
import QRTag from "../components/QRTag";
import EditAssetModal from "../components/EditAssetModal";
import { generatePreventiveRecommendation } from "../lib/aiTriage";
import { uploadEvidence, EvidenceUploadError } from "../lib/evidence";
import type {
  Asset,
  Issue,
  HistoryEntry,
  IssueStatus,
  MaintenanceRecord,
} from "../types";

const NEXT_STATUS: Record<IssueStatus, IssueStatus[]> = {
  Reported: ["Assigned"],
  Assigned: ["Inspection Started"],
  "Inspection Started": ["Maintenance In Progress", "Waiting for Parts"],
  "Maintenance In Progress": ["Resolved", "Waiting for Parts"],
  "Waiting for Parts": ["Maintenance In Progress"],
  Resolved: ["Closed", "Reopened"],
  Closed: ["Reopened"],
  Reopened: ["Inspection Started"],
};

export default function AssetDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recommendation, setRecommendation] = useState<string>("");

  async function refresh() {
    if (!id) return;
    setLoading(true);
    const [a, i, h] = await Promise.all([
      getAsset(id),
      listIssues(id),
      listHistory(id),
    ]);
    setAsset(a);
    setIssues(i);
    setHistory(h);

    // Generate preventive recommendation
    if (a) {
      const issueCategories = i.map((iss) => iss.category);
      const rec = await generatePreventiveRecommendation(
        a.category,
        a.last_service_date,
        i.length,
        issueCategories,
      );
      setRecommendation(rec);
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (loading)
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-steel-300">
        Loading…
      </div>
    );
  if (!asset)
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-steel-300">
        Asset not found.
      </div>
    );

  const publicUrl = `${window.location.origin}/a/${asset.code}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-steel-300 hover:text-mist-100"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold text-mist-100">
              {asset.name}
            </h1>
            <AssetStatusBadge status={asset.status} />
          </div>
          <p className="font-mono text-sm text-amber-500">{asset.code}</p>
          <p className="mt-1 text-sm text-steel-300">
            {asset.location} · {asset.category} · Condition: {asset.condition}
          </p>
        </div>
        {user?.role === "admin" && (
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Edit size={16} /> Edit asset
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Plate>
            <h2 className="mb-4 font-display text-base font-semibold text-mist-100">
              Issues on this asset
            </h2>
            {issues.length === 0 && (
              <p className="text-sm text-steel-300">No issues reported yet.</p>
            )}
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  canManage={!!user}
                  onOpenMaintenance={() => setActiveIssue(issue)}
                  onChanged={refresh}
                />
              ))}
            </div>
          </Plate>

          <Plate>
            <div className="mb-4 flex items-center gap-2">
              <Clock size={16} className="text-steel-300" />
              <h2 className="font-display text-base font-semibold text-mist-100">
                Asset history
              </h2>
            </div>
            {history.length === 0 && (
              <p className="text-sm text-steel-300">No history recorded yet.</p>
            )}
            <ol className="space-y-4 border-l border-graphite-700 pl-4">
              {history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <p className="text-sm text-mist-100">{h.action}</p>
                  <p className="mt-0.5 text-xs text-steel-500">
                    {h.actor} · {new Date(h.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </Plate>

          <ServiceDatesCard asset={asset} onUpdated={refresh} />

          {recommendation && (
            <Plate className="border-l-4 border-l-amber-500">
              <h2 className="mb-2 font-display text-base font-semibold text-amber-500">
                Preventive maintenance recommendation
              </h2>
              <p className="text-sm text-steel-300">{recommendation}</p>
            </Plate>
          )}
        </div>

        <div className="space-y-6">
          <Plate>
            <QRTag url={publicUrl} code={asset.code} label={asset.name} />
          </Plate>
          <Plate className="text-sm text-steel-300">
            <p className="mb-2 font-display text-sm font-semibold text-mist-100">
              Print-ready label
            </p>
            <p>
              Includes organization name, asset name, code, location, QR, and
              scan instructions — use Download above and print at your facility.
            </p>
          </Plate>
        </div>
      </div>

      {activeIssue && (
        <MaintenanceModal
          issue={activeIssue}
          technician={user?.name ?? "Technician"}
          onClose={() => setActiveIssue(null)}
          onSaved={refresh}
        />
      )}

      {showEditModal && asset && (
        <EditAssetModal
          asset={asset}
          onClose={() => setShowEditModal(false)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}

function IssueRow({
  issue,
  canManage,
  onOpenMaintenance,
  onChanged,
}: {
  issue: Issue;
  canManage: boolean;
  onOpenMaintenance: () => void;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const [techName, setTechName] = useState("");
  const nextOptions = NEXT_STATUS[issue.status] ?? [];
  const isAdminUser = user?.role === "admin";
  const isTechnicianUser = user?.role === "technician";
  const isAssignedTechnician =
    isTechnicianUser && issue.assigned_technician === user?.name;

  async function handleAssign() {
    if (!techName.trim()) return;
    await assignTechnician(
      issue,
      techName.trim(),
      user?.name ?? "Administrator",
    );
    setTechName("");
    onChanged();
  }

  async function handleStatus(status: IssueStatus) {
    if (status === "Resolved") {
      onOpenMaintenance();
      return;
    }
    await updateIssueStatus(issue, status, user?.name ?? "Technician");
    onChanged();
  }

  async function handleOutOfService() {
    await markOutOfService(issue, user?.name ?? "Technician");
    onChanged();
  }

  return (
    <div className="rounded-md border border-graphite-700 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-amber-500">
          {issue.issue_number}
        </span>
        <PriorityBadge priority={issue.priority} />
        <IssueStatusBadge status={issue.status} />
      </div>
      <h3 className="mt-2 font-display text-sm font-semibold text-mist-100">
        {issue.title}
      </h3>
      <p className="mt-1 text-sm text-steel-300">{issue.description}</p>
      {issue.ai_possible_causes?.length > 0 && (
        <p className="mt-2 text-xs text-steel-500">
          Possible causes: {issue.ai_possible_causes.join(", ")}
        </p>
      )}
      <p className="mt-1 text-xs text-steel-500">
        Reported by {issue.reporter_name} ·{" "}
        {new Date(issue.created_at).toLocaleString()}
      </p>
      {issue.assigned_technician && (
        <p className="mt-1 text-xs text-teal-400">
          Assigned to {issue.assigned_technician}
        </p>
      )}
      {issue.evidence_url && (
        <a
          href={issue.evidence_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block w-fit"
        >
          <img
            src={issue.evidence_url}
            alt="Reported evidence"
            className="h-20 w-20 rounded-md border border-graphite-700 object-cover"
          />
        </a>
      )}

      {canManage && !["Closed", "Retired" as string].includes(issue.status) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-graphite-700 pt-3">
          {isAdminUser && !issue.assigned_technician && (
            <>
              <input
                className={`${inputClass} w-auto max-w-[180px] !py-1.5`}
                placeholder="Technician name"
                value={techName}
                onChange={(e) => setTechName(e.target.value)}
              />
              <Button variant="secondary" onClick={handleAssign}>
                Assign
              </Button>
            </>
          )}
          {(isAdminUser || isAssignedTechnician) &&
            nextOptions.map((s) => (
              <Button
                key={s}
                variant={s === "Resolved" ? "primary" : "secondary"}
                onClick={() => handleStatus(s)}
              >
                Mark {s}
              </Button>
            ))}
          {isAdminUser &&
            issue.priority === "Critical" &&
            issue.status !== "Resolved" && (
              <Button variant="danger" onClick={handleOutOfService}>
                Mark asset Out of Service
              </Button>
            )}
          {isTechnicianUser &&
            !isAssignedTechnician &&
            issue.status === "Assigned" && (
              <p className="text-xs text-steel-400">
                This issue is assigned to{" "}
                {issue.assigned_technician || "another technician"}
              </p>
            )}
        </div>
      )}
    </div>
  );
}

function MaintenanceModal({
  issue,
  technician,
  onClose,
  onSaved,
}: {
  issue: Issue;
  technician: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [parts, setParts] = useState("");
  const [cost, setCost] = useState("0");
  const [minutes, setMinutes] = useState("30");
  const [finalCondition, setFinalCondition] = useState("Good");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  function handleEvidenceChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setEvidenceFile(file);
    setEvidencePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearEvidence() {
    setEvidenceFile(null);
    setEvidencePreview(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!notes.trim()) {
      setError("A maintenance note is required to resolve an issue.");
      return;
    }
    if (Number(cost) < 0) {
      setError("Cost cannot be negative.");
      return;
    }
    setSaving(true);
    try {
      let evidence_url: string | null = null;
      if (evidenceFile) {
        try {
          evidence_url = await uploadEvidence(evidenceFile, "maintenance");
        } catch (err) {
          const message =
            err instanceof EvidenceUploadError
              ? err.message
              : "Evidence upload failed.";
          setError(message);
          setSaving(false);
          return;
        }
      }

      const record: Omit<MaintenanceRecord, "id" | "created_at"> = {
        issue_id: issue.id,
        technician: issue.assigned_technician ?? technician,
        notes: notes.trim(),
        parts_used: parts.trim(),
        cost: Number(cost),
        time_spent_minutes: Number(minutes),
        final_condition: finalCondition,
        evidence_url,
      };
      await createMaintenanceRecord(record, issue, user?.name ?? technician);
      await updateIssueStatus(issue, "Resolved", user?.name ?? technician);
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-950/80 px-4">
      <div className="plate w-full max-w-md max-h-[85vh] overflow-y-auto p-6">
        <h2 className="mb-1 font-display text-lg font-semibold text-mist-100">
          Resolve {issue.issue_number}
        </h2>
        <p className="mb-5 text-sm text-steel-300">
          A maintenance note is required before an issue can be resolved.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Maintenance notes">
            <textarea
              className={`${inputClass} min-h-[90px]`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </Field>
          <Field label="Parts used">
            <input
              className={inputClass}
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="e.g. HDMI cable"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cost">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </Field>
            <Field label="Time (minutes)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Final condition">
            <select
              className={inputClass}
              value={finalCondition}
              onChange={(e) => setFinalCondition(e.target.value)}
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </Field>
          <Field label="Photo evidence (optional)">
            {evidencePreview ? (
              <div className="flex items-center gap-3">
                <img
                  src={evidencePreview}
                  alt="Evidence preview"
                  className="h-16 w-16 rounded-md border border-graphite-700 object-cover"
                />
                <Button
                  variant="secondary"
                  type="button"
                  onClick={clearEvidence}
                >
                  <X size={14} /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-graphite-600 px-3 py-2 text-sm text-steel-300 hover:border-amber-500/50">
                <Paperclip size={14} />
                Attach a photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleEvidenceChange}
                />
              </label>
            )}
          </Field>
          {error && <p className="text-sm text-danger-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Saving…" : "Resolve issue"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ServiceDatesCard({
  asset,
  onUpdated,
}: {
  asset: Asset;
  onUpdated: () => void;
}) {
  const [last, setLast] = useState(asset.last_service_date ?? "");
  const [next, setNext] = useState(asset.next_service_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await updateAssetServiceDates(asset.id, last, next);
      onUpdated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Plate>
      <h2 className="mb-4 font-display text-base font-semibold text-mist-100">
        Service schedule
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Last service date">
          <input
            type="date"
            className={inputClass}
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
        </Field>
        <Field label="Next service date">
          <input
            type="date"
            className={inputClass}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      <Button
        variant="secondary"
        onClick={save}
        disabled={saving}
        className="mt-4"
      >
        {saving ? "Saving…" : "Save schedule"}
      </Button>
    </Plate>
  );
}
