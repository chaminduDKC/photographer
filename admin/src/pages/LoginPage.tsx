import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Camera, Lock } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: FormData) => authApi.login(data.email, data.password),
    onSuccess: (res) => {
      setAuth(res.data.data.admin);
      navigate('/');
    },
    onError: () => {
      toast.error('Invalid email or password');
    },
  });

  const onSubmit = (data: FormData) => loginMutation.mutate(data);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
          },
        }}
      />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
            <Camera className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to manage your portfolio, albums & inquiries
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="admin@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              isLoading={loginMutation.isPending}
            >
              <Lock className="h-4 w-4" /> Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Protected photographer management system
        </p>
      </div>
    </div>
  );
}
