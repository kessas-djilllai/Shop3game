import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''; // wait, anon key cannot alter tables usually.
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('alter_users_table_maybe');
  // Or we can just use Postgres directly if we have service key? We don't.
  console.log(error);
}
test();
