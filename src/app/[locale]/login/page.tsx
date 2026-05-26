import { useTranslations } from 'next-intl';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { MessageSquare } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('HomePage');
  const navT = useTranslations('Navigation');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="bg-indigo-600 p-3 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{navT('signIn')}</h1>
          <p className="mt-2 text-slate-600">
            {t('enterCode')}
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
