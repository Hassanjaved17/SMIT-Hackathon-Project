-- Required for the Dashboard's live-updates feature to actually receive
-- change events. Without this, postgres_changes subscriptions connect
-- successfully but never fire.
alter publication supabase_realtime add table issues;
alter publication supabase_realtime add table assets;