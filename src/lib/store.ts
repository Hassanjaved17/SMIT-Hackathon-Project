import { supabase, isSupabaseConfigured } from './supabase';
import type { Asset, Issue, MaintenanceRecord, HistoryEntry, AssetStatus, IssueStatus } from '../types';

const LS_KEY = 'maintainiq_demo_v1';

interface DemoDB {
  assets: Asset[];
  issues: Issue[];
  maintenance: MaintenanceRecord[];
  history: HistoryEntry[];
}

const SEED_ASSETS: Asset[] = [
  mkAsset('AST-0001', 'Classroom Projector 01', 'Electronics', 'Room 204, Block B', 'Good'),
  mkAsset('AST-0002', 'Central AC Unit - Lobby', 'HVAC', 'Ground Floor Lobby', 'Fair'),
  mkAsset('AST-0003', 'Fire Extinguisher - Lab 3', 'Safety', 'Science Lab 3', 'Good'),
  mkAsset('AST-0004', 'Elevator - East Wing', 'Mechanical', 'East Wing', 'Good'),
  mkAsset('AST-0005', 'Water Cooler - Cafeteria', 'Plumbing', 'Cafeteria', 'Fair'),
];

function mkAsset(code: string, name: string, category: string, location: string, condition: string): Asset {
  return {
    id: crypto.randomUUID(),
    code,
    name,
    category,
    location,
    condition,
    status: 'Operational',
    last_service_date: '2026-05-01',
    next_service_date: '2026-11-01',
    assigned_technician: null,
    created_at: new Date().toISOString(),
  };
}

function loadDemo(): DemoDB {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) return JSON.parse(raw);
  const db: DemoDB = { assets: SEED_ASSETS, issues: [], maintenance: [], history: [] };
  localStorage.setItem(LS_KEY, JSON.stringify(db));
  return db;
}

function saveDemo(db: DemoDB) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function resetDemoData() {
  localStorage.removeItem(LS_KEY);
}

export function generateAssetCode(existing: Asset[]): string {
  const nums = existing.map((a) => parseInt(a.code.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `AST-${String(next).padStart(4, '0')}`;
}

export function generateIssueNumber(existing: Issue[]): string {
  const nums = existing.map((i) => parseInt(i.issue_number.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ISS-${String(next).padStart(4, '0')}`;
}

// ---------- ASSETS ----------

export async function listAssets(): Promise<Asset[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Asset[];
  }
  return loadDemo().assets.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getAsset(id: string): Promise<Asset | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('assets').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Asset | null;
  }
  return loadDemo().assets.find((a) => a.id === id) || null;
}

export async function getAssetByCode(code: string): Promise<Asset | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('assets').select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    return data as Asset | null;
  }
  return loadDemo().assets.find((a) => a.code.toLowerCase() === code.toLowerCase()) || null;
}

export async function createAsset(input: Omit<Asset, 'id' | 'created_at' | 'status'>): Promise<Asset> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('assets')
      .insert({ ...input, status: 'Operational' })
      .select()
      .single();
    if (error) throw error;
    await addHistory((data as Asset).id, null, 'Administrator', 'Asset registered');
    return data as Asset;
  }
  const db = loadDemo();
  if (db.assets.some((a) => a.code.toLowerCase() === input.code.toLowerCase())) {
    throw new Error('Duplicate asset code');
  }
  const asset: Asset = { ...input, id: crypto.randomUUID(), status: 'Operational', created_at: new Date().toISOString() };
  db.assets.push(asset);
  saveDemo(db);
  await addHistory(asset.id, null, 'Administrator', 'Asset registered');
  return asset;
}

export async function updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'created_at'>>): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('assets').update(updates).eq('id', id);
    if (error) throw error;
    const changedFields = Object.keys(updates).filter(k => updates[k as keyof typeof updates] !== undefined);
    if (changedFields.length > 0) {
      await addHistory(id, null, 'Administrator', `Asset details updated: ${changedFields.join(', ')}`);
    }
    return;
  }
  const db = loadDemo();
  const asset = db.assets.find((a) => a.id === id);
  if (asset) {
    Object.assign(asset, updates);
    saveDemo(db);
    const changedFields = Object.keys(updates).filter(k => updates[k as keyof typeof updates] !== undefined);
    if (changedFields.length > 0) {
      await addHistory(id, null, 'Administrator', `Asset details updated: ${changedFields.join(', ')}`);
    }
  }
}

export async function updateAssetStatus(id: string, status: AssetStatus): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('assets').update({ status }).eq('id', id);
    if (error) throw error;
    return;
  }
  const db = loadDemo();
  const asset = db.assets.find((a) => a.id === id);
  if (asset) {
    asset.status = status;
    saveDemo(db);
  }
}

export async function updateAssetServiceDates(id: string, lastServiceDate: string, nextServiceDate: string): Promise<void> {
  if (nextServiceDate < lastServiceDate) throw new Error('Next service date cannot be before completion date');
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('assets')
      .update({ last_service_date: lastServiceDate, next_service_date: nextServiceDate })
      .eq('id', id);
    if (error) throw error;
    return;
  }
  const db = loadDemo();
  const asset = db.assets.find((a) => a.id === id);
  if (asset) {
    asset.last_service_date = lastServiceDate;
    asset.next_service_date = nextServiceDate;
    saveDemo(db);
  }
}

// ---------- ISSUES ----------

export async function listIssues(assetId?: string): Promise<Issue[]> {
  if (isSupabaseConfigured) {
    let q = supabase.from('issues').select('*').order('created_at', { ascending: false });
    if (assetId) q = q.eq('asset_id', assetId);
    const { data, error } = await q;
    if (error) throw error;
    return data as Issue[];
  }
  const db = loadDemo();
  return db.issues
    .filter((i) => !assetId || i.asset_id === assetId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getIssue(id: string): Promise<Issue | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('issues').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as Issue | null;
  }
  return loadDemo().issues.find((i) => i.id === id) || null;
}

export async function getIssueByNumber(issueNumber: string): Promise<Issue | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('issue_number', issueNumber.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return data as Issue | null;
  }
  return (
    loadDemo().issues.find(
      (i) => i.issue_number.toUpperCase() === issueNumber.trim().toUpperCase()
    ) || null
  );
}

export async function createIssue(input: Omit<Issue, 'id' | 'created_at' | 'issue_number' | 'status'>): Promise<Issue> {
  const existing = await listIssues();
  const issue_number = generateIssueNumber(existing);
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('issues')
      .insert({ ...input, issue_number, status: 'Reported' })
      .select()
      .single();
    if (error) throw error;
    await updateAssetStatus(input.asset_id, 'Issue Reported');
    await addHistory(input.asset_id, (data as Issue).id, input.reporter_name || 'Reporter', `Issue ${issue_number} reported: ${input.title}`);
    return data as Issue;
  }
  const db = loadDemo();
  const issue: Issue = { ...input, id: crypto.randomUUID(), issue_number, status: 'Reported', created_at: new Date().toISOString() };
  db.issues.push(issue);
  saveDemo(db);
  await updateAssetStatus(input.asset_id, 'Issue Reported');
  await addHistory(input.asset_id, issue.id, input.reporter_name || 'Reporter', `Issue ${issue_number} reported: ${input.title}`);
  return issue;
}

const ISSUE_TO_ASSET_STATUS: Partial<Record<IssueStatus, AssetStatus>> = {
  'Inspection Started': 'Under Inspection',
  'Maintenance In Progress': 'Under Maintenance',
  Resolved: 'Operational',
};

export async function updateIssueStatus(issue: Issue, status: IssueStatus, actor: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('issues').update({ status }).eq('id', issue.id);
    if (error) throw error;
  } else {
    const db = loadDemo();
    const found = db.issues.find((i) => i.id === issue.id);
    if (found) {
      found.status = status;
      saveDemo(db);
    }
  }
  const assetStatus = ISSUE_TO_ASSET_STATUS[status];
  if (assetStatus) await updateAssetStatus(issue.asset_id, assetStatus);
  await addHistory(issue.asset_id, issue.id, actor, `Issue ${issue.issue_number} status changed to ${status}`);
}

export async function assignTechnician(issue: Issue, technician: string, actor: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('issues').update({ assigned_technician: technician, status: 'Assigned' }).eq('id', issue.id);
    if (error) throw error;
  } else {
    const db = loadDemo();
    const found = db.issues.find((i) => i.id === issue.id);
    if (found) {
      found.assigned_technician = technician;
      found.status = 'Assigned';
      saveDemo(db);
    }
  }
  await addHistory(issue.asset_id, issue.id, actor, `Issue ${issue.issue_number} assigned to ${technician}`);
}

export async function markOutOfService(issue: Issue, actor: string): Promise<void> {
  await updateAssetStatus(issue.asset_id, 'Out of Service');
  await addHistory(issue.asset_id, issue.id, actor, `Asset marked Out of Service due to critical issue ${issue.issue_number}`);
}

// ---------- MAINTENANCE RECORDS ----------

export async function listMaintenanceRecords(issueId: string): Promise<MaintenanceRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MaintenanceRecord[];
  }
  return loadDemo().maintenance.filter((m) => m.issue_id === issueId);
}

/** All maintenance records across every issue — used by the analytics dashboard. */
export async function listAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data as MaintenanceRecord[];
  }
  return loadDemo().maintenance;
}

export async function createMaintenanceRecord(
  input: Omit<MaintenanceRecord, 'id' | 'created_at'>,
  issue: Issue,
  actor: string
): Promise<MaintenanceRecord> {
  if (input.cost < 0) throw new Error('Maintenance cost cannot be negative');
  let record: MaintenanceRecord;
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('maintenance_records').insert(input).select().single();
    if (error) throw error;
    record = data as MaintenanceRecord;
  } else {
    const db = loadDemo();
    record = { ...input, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    db.maintenance.push(record);
    saveDemo(db);
  }
  await addHistory(issue.asset_id, issue.id, actor, `Maintenance note added by ${input.technician}`);
  return record;
}

// ---------- HISTORY ----------

export async function listHistory(assetId: string): Promise<HistoryEntry[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as HistoryEntry[];
  }
  return loadDemo()
    .history.filter((h) => h.asset_id === assetId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function addHistory(assetId: string, issueId: string | null, actor: string, action: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('history').insert({ asset_id: assetId, issue_id: issueId, actor, action });
    if (error) throw error;
    return;
  }
  const db = loadDemo();
  db.history.push({ id: crypto.randomUUID(), asset_id: assetId, issue_id: issueId, actor, action, created_at: new Date().toISOString() });
  saveDemo(db);
}
