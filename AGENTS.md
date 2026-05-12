# Project instructions

## Tech stack

Frontend:
- Next.js
- TypeScript
- React
- shadcn/ui + Tailwind
- UI should support English and Spanish from the beginning

## Domain model

- Teacher
- Student
- ExerciseSet
- Question
- Attempt

## Frontend instructions

- Create reusable React components when it makes the UI clearer or avoids duplication.
- Do not put all UI logic into one page component if it becomes too large.
- All user-facing UI text must be prepared for localization in English and Spanish.
- Do not hardcode visible UI strings directly in components if localization can be used.
- UI should be mobile first
- Ask if it makes sense to use some UI library 
- Don't use round corners for cards on UI. Keep round corners for buttons and icons.
- Prefer reusable semantic CSS utility classes for repeated layout and card styles instead of duplicating long Tailwind class strings in JSX.
- use npm run lint 
