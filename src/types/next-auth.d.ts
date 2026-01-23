import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      userType: 'tenant' | 'host';
    };
  }

  interface User {
    id: string;
    email: string;
    userType: 'tenant' | 'host';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userType: 'tenant' | 'host';
  }
}
