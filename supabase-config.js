// Supabase configuration for multiplayer mode
// Note: This is loaded dynamically to prevent blocking the main app

// Supabase project URL and anon key
// Note: Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
           SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
           SUPABASE_URL && SUPABASE_ANON_KEY;
}
