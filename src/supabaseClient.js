import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://tuxgxwmondnyjhtdufbx.supabase.co'
const supabaseAnon ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eGd4d21vbmRueWpodGR1ZmJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjAyODcsImV4cCI6MjA3NjYzNjI4N30._GXZHzuN9Gl12xX0GLtyVchpaym0rFi1dA9UE53OpD0'
export const supabase = createClient(supabaseUrl, supabaseAnon)
