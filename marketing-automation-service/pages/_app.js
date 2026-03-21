import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider
      session={session}
      basePath="/api/auth"
      refetchOnWindowFocus={false}
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}
