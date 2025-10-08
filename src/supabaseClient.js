import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mrcnblfvpetsnplehnva.supabase.co'
const supabaseAnon ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yY25ibGZ2cGV0c25wbGVobnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2OTE4NTgsImV4cCI6MjA3NTI2Nzg1OH0.rfSz2w7CsSt7pbeERW2YRJe3QXQ5xi4oGXKlmvL9vNE'

export const supabase = createClient(supabaseUrl, supabaseAnon)
