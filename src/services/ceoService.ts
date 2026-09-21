import { supabase } from "../lib/supabase";

const validPin = (pin: string) => /^\d{4}$/.test(pin);

export async function setCeoPin(pin: string): Promise<void> {
  if (!validPin(pin)) throw new Error("CEO PIN must be exactly 4 digits.");
  const { error } = await supabase.rpc("set_ceo_pin", { pin });
  if (error) throw new Error(error.message);
}

export async function verifyCeoPin(pin: string): Promise<boolean> {
  if (!validPin(pin)) return false;
  const { data, error } = await supabase.rpc("verify_ceo_pin", { pin });
  if (error) throw new Error(error.message);
  return data === true;
}
