import AuthProvider from '../providers/AuthProvider';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AuthProvider>{children}</AuthProvider>;
}