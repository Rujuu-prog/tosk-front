"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ResetRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Basic token validation before redirect
      if (token.length >= 10 && /^[a-zA-Z0-9-]+$/.test(token)) {
        // Redirect to the proper password reset confirm page with token
        router.replace(`/auth/password-reset/confirm?token=${encodeURIComponent(token)}`);
      } else {
        // Invalid token format, redirect to reset request page
        router.replace('/auth/password-reset');
      }
    } else {
      // No token provided, redirect to password reset request page
      router.replace('/auth/password-reset');
    }
  }, [token, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '16px',
      color: '#666'
    }}>
      リダイレクト中...
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        読み込み中...
      </div>
    }>
      <ResetRedirect />
    </Suspense>
  );
}