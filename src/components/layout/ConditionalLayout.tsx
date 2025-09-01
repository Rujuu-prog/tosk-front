'use client';

import { Container, Text } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/lib/contexts/AuthContext';
import { NavBar } from './NavBar';

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/password-reset', '/landing'];
const isAuthPath = (pathname: string) => 
  AUTH_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !isAuthPath(pathname) && pathname !== '/auth/login') {
      // 認証されていない場合、認証系ページ以外からログインページへリダイレクト
      router.replace('/auth/login');
    }
  }, [user, loading, pathname, router]);

  // 認証系ページの場合、NavBarなしでそのまま表示
  if (isAuthPath(pathname)) {
    return <>{children}</>;
  }

  // ローディング中の表示
  if (loading) {
    return (
      <Container size="xl" py="md">
        <Text ta="center">読み込み中...</Text>
      </Container>
    );
  }

  // 未認証の場合は何も表示しない（リダイレクトが実行される）
  if (!user) {
    return null;
  }

  // 認証済みの場合、NavBarと共に表示
  return <NavBar>{children}</NavBar>;
}