'use client';

import { useEffect } from 'react';

export default function TeacherNameSaver({ name }: { name: string }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && name) {
      localStorage.setItem('studentName', name);
      window.dispatchEvent(new Event('studentNameUpdated'));
    }
  }, [name]);

  return null;
}
