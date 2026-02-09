import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      userType: 'tenant' | 'host' | 'support';
      onboardingCompleted?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    userType: 'tenant' | 'host' | 'support';
    onboardingCompleted?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType: 'tenant' | 'host' | 'support';
    onboardingCompleted?: boolean;
  }
}
