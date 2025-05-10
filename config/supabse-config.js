import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

//Testing Console
// console.log(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_KEY
// )

//Initialised Supabase.
//If not have URL/Key ask Snehansu for the .env file :)
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)