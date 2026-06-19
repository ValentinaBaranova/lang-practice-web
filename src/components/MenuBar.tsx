'use client';

import { useState, useRef, useEffect } from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname, useRouter, routing} from '@/routing';
import { Globe, MessageSquare, ChevronDown, Check, User, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import GoogleSignInButton from './GoogleSignInButton';

export default function MenuBar() {
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  // Legacy: previously read accessCode from params; no longer used

  const { teacher, logout, isLoading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  const logoutStudent = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studentName');
        // Notify listeners in this tab and across components
        window.dispatchEvent(new Event('studentNameUpdated'));
      }
    } catch {
      // no-op
    }
  };

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale as (typeof routing.locales)[number]});
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Removed fetching teacher by accessCode; rely on authenticated `teacher` from useAuth

  // Load student's name from localStorage to display in the menu bar during practice
  useEffect(() => {
    const readName = () => {
      try {
        const name = typeof window !== 'undefined' ? localStorage.getItem('studentName') : null;
        setStudentName(name && name.trim() ? name : null);
      } catch {
        setStudentName(null);
      }
    };

    readName();

    // Keep in sync across tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'studentName') {
        readName();
      }
    };
    window.addEventListener('storage', onStorage);

    // Also listen for same-tab updates triggered explicitly after setting the name
    const onSameTabUpdate = () => readName();
    window.addEventListener('studentNameUpdated', onSameTabUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('studentNameUpdated', onSameTabUpdate as EventListener);
    };
  }, []);


  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  const displayName = teacher?.name || studentName;

  return (
    <nav className="bg-white border-b border-slate-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white fill-white" />
            </div>
            {/* Mobile: show only icon and i18n short title; Desktop: show full title */}
            <Link href="/" className="text-xl font-extrabold text-slate-900">
              <span className="hidden sm:inline">{t('title')}</span>
              <span className="sm:hidden">{t('shortTitle')}</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {!isLoading && !teacher && !studentName && (
              <>
                <div className="hidden sm:block">
                  <GoogleSignInButton />
                </div>
                <div className="sm:hidden">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    {t('signIn')}
                  </Link>
                </div>
              </>
            )}
            {displayName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-sm font-semibold text-slate-700">
                <User className="w-4 h-4 text-slate-400 hidden sm:block" />
                <span className="max-w-[40vw] truncate hidden sm:inline leading-none">
                  {displayName}
                </span>
                <span className="sm:hidden truncate max-w-[24vw] leading-none">
                  {displayName}
                </span>
                {(teacher || studentName) && (
                  <button
                    onClick={teacher ? logout : logoutStudent}
                    className="ml-2 p-0 text-slate-400 hover:text-red-500 transition-colors"
                    title={teacher ? 'Sign out' : 'Clear name'}
                    aria-label={teacher ? 'Sign out' : 'Clear name'}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-sm font-semibold text-slate-700"
              >
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">{locale === 'en' ? 'English' : 'Español'}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <span>{lang.label}</span>
                      {locale === lang.code && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
