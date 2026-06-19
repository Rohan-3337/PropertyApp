import { createClerkSupabaseClient } from "@/utils/supabase";
import { useAuth } from "@clerk/expo";
import { useMemo } from "react";

export function useSupabase() {
  const { getToken } = useAuth();

  const client = useMemo(
    () =>
      createClerkSupabaseClient(async () => {
        // No template needed anymore — use session token directly
        return await getToken();
      }),
    [getToken]
  );

  return client;
}