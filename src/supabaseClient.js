import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ybhrwutxoebdjfpzaznb.supabase.co'
const supabaseAnon ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHJ3dXR4b2ViZGpmcHphem5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0OTgxMDEsImV4cCI6MjA3NzA3NDEwMX0.TMvAnWxnn2NrWxp8vMCKJJBowMXj6KUerlXsO1V2LU4'

export const supabase = createClient(supabaseUrl, supabaseAnon)
