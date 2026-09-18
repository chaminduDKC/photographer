import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { businessApi, type BusinessInfo } from '../api/business.api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Building2, Save } from 'lucide-react';

const schema = z.object({
  phone1: z.string().min(1, 'Primary phone is required'),
  phone2: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
});

type FormData = z.infer<typeof schema>;

export function BusinessPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: businessApi.get,
    staleTime: 1000 * 60 * 5,
  });

  const info = data?.data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone1: '',
      phone2: '',
      whatsapp: '',
      address: '',
      city: '',
      province: '',
    },
  });

  useEffect(() => {
    if (info) reset(info);
  }, [info, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      businessApi.update(data as Omit<BusinessInfo, 'id' | 'updatedAt'>),
    onSuccess: () => {
      toast.success('Business info updated!');
      queryClient.invalidateQueries({ queryKey: ['business'] });
    },
    onError: () => toast.error('Failed to save business info'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Details</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are publicly showcased in your portfolio contact section and footer.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Contact Channels
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phone numbers and WhatsApp channels for clients to get in touch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Primary Phone *"
              id="phone1"
              placeholder="+1 (555) 000-0000"
              error={errors.phone1?.message}
              {...register('phone1')}
            />
            <Input
              label="Secondary Phone (optional)"
              id="phone2"
              placeholder="+1 (555) 000-0001"
              error={errors.phone2?.message}
              {...register('phone2')}
            />
            <div className="sm:col-span-2">
              <Input
                label="WhatsApp Number (optional)"
                id="whatsapp"
                placeholder="+15550000000"
                error={errors.whatsapp?.message}
                {...register('whatsapp')}
              />
            </div>
          </div>

          <div className="border-b border-slate-100 pt-4 pb-4">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Studio Location
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical address details rendered in website footer and contact maps.
            </p>
          </div>

          <div className="space-y-5">
            <Input
              label="Street Address *"
              id="address"
              placeholder="123 Studio Boulevard, Suite 400"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="City *"
                id="city"
                placeholder="Colombo"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Province / State *"
                id="province"
                placeholder="Western Province"
                error={errors.province?.message}
                {...register('province')}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-6">
            <Button
              type="submit"
              isLoading={mutation.isPending}
              disabled={!isDirty && !!info}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4" /> Save Information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
