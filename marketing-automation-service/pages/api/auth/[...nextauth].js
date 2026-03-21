import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '../../../lib/db.js';
import User from '../../../lib/models/User.js';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No account found with this email');
        const valid = await user.comparePassword(credentials.password);
        if (!valid) throw new Error('Incorrect password');
        return { id: user._id.toString(), name: user.name, email: user.email, clientId: user.clientId, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.clientId = user.clientId; token.role = user.role; token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      session.user.clientId = token.clientId;
      session.user.role     = token.role;
      session.user.id       = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  // Let Vercel auto-detect the URL — avoids CLIENT_FETCH_ERROR on preview deployments
  ...(process.env.VERCEL_URL && !process.env.NEXTAUTH_URL
    ? { url: `https://${process.env.VERCEL_URL}` }
    : {}),
});
