import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xohzuroqyftdcntnxxhl.supabase.co';
const supabaseAnonKey = 'sb_publishable_aj8N2CGeh93w1deT_MB5dw_Gw8JAAQx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);