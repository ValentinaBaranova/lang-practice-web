'use client';

import { useState, useRef, useEffect } from 'react';
import {useLocale} from 'next-intl';
import {Link, usePathname, useRouter, routing} from '@/routing';
import { useParams } from 'next/navigation';
import { Globe, MessageSquare, ChevronDown, Check } from 'lucide-react';

export default function MenuBar() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const accessCode = params?.accessCode as string;

  const [isOpen, setIsOpen] = useState(false);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale as (typeof routing.locales)[number]});
    setIsOpen(false);
  };

  useEffect(() => {
    const fetchTeacherName = async () => {
      if (accessCode) {
        try {
          const res = await fetch(`/api/teachers/${accessCode}`);
          if (res.ok) {
            const data = await res.json();
            setTeacherName(data.name);
          }
        } catch (error) {
          console.error('Failed to fetch teacher name:', error);
        }
      } else if (pathname.includes('/practice/')) {
        const shareSlug = pathname.split('/practice/')[1]?.split('/')[0];
        if (shareSlug) {
          try {
            const res = await fetch(`/api/exercise-sets/share/${shareSlug}`);
            if (res.ok) {
              const data = await res.json();
              setTeacherName(data.teacherName);
            }
          } catch (error) {
            console.error('Failed to fetch teacher name from exercise:', error);
          }
        }
      } else if (routing.locales.includes(pathname.replace(/^\//, '') as (typeof routing.locales)[number]) || pathname === '/') {
        // No default teacher name for home page
        setTeacherName(null);
      }
    };

    fetchTeacherName();
  }, [accessCode, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            {teacherName && (
              <div className="text-sm font-medium text-slate-700 hidden sm:block">
                {teacherName}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
