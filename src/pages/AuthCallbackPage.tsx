import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          navigate("/sign-in");
        } else {
          navigate("/home");
        }
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/home");
        } else {
          navigate("/sign-in");
        }
      });
    }
  }, []);

  return <p style={{ padding: "2rem", textAlign: "center" }}>Signing you in…</p>;
}
