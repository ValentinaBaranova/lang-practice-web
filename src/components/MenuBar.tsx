'use client';

import { useState, useRef, useEffect } from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, usePathname, useRouter, routing} from '@/routing';
import { Globe, MessageSquare, ChevronDown, Check, User } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function MenuBar() {
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const accessCode = params?.accessCode as string | undefined;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);

  if (!accessCode && teacherName !== null) {
    setTeacherName(null);
  }

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

  useEffect(() => {
    if (accessCode) {
      const abortController = new AbortController();
      fetch(`/api/teachers/${accessCode}`, { signal: abortController.signal })
        .then(res => {
          if (!res.ok) throw new Error('Teacher not found');
          return res.json();
        })
        .then(data => {
          if (data.name) {
            setTeacherName(data.name);
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch teacher info', err);
            setTeacherName(null);
          }
        });
      return () => abortController.abort();
    }
  }, [accessCode]);


  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  return (
    <nav className="bg-white border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white fill-white" />
            </div>
            <Link href="/" className="text-xl font-extrabold text-slate-900">
              LangPractice
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {teacherName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 hidden md:inline">
                  {t('teacher')}: {teacherName}
                </span>
              </div>
            )}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="btn-outline"
              >
                <Globe className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">{locale === 'en' ? 'English' : 'Español'}</span>
                <span className="sm:hidden uppercase">{locale}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in duration-200">
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
