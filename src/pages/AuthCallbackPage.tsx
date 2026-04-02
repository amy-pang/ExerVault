import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      } else {
        navigate("/sign-in");
      }
    });
  }, [navigate]);

  return <p style={{ padding: "2rem", textAlign: "center" }}>Signing you in…</p>;
}
