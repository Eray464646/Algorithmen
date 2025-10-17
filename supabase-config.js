// Supabase configuration for multiplayer mode
// Note: This is loaded dynamically to prevent blocking the main app

// Supabase project URL and anon key
// Note: Replace with your actual Supabase credentials
const SUPABASE_URL = 'https://ydvrarshdvjdlyrdvoau.supabase.co'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnJhcnNoZHZqZGx5cmR2b2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzU5MDYsImV4cCI6MjA3NjIxMTkwNn0.Ii-Nmd8gzrNAJMB_evnDNwawGwkq3vOcpLAV58GFd5M';

// Supabase client - will be initialized dynamically
export let supabase = null;

// Initialize Supabase dynamically (non-blocking)
export async function initSupabase() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    } catch (error) {
        console.warn('Failed to load Supabase:', error);
        return false;
    }
}

// Helper function to check if Supabase is configured
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}

