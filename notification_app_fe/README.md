# Campus Notifications Frontend

A notification dashboard with a priority inbox, built as a production-style Next.js app. It includes a reusable logging middleware, a Node.js script for ranking notifications, and a full UI for browsing, filtering, and marking notifications.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Material UI (MUI)

## Setup
```bash
npm install
npm run dev
```

## Auth Setup
Update the values inside [src/config/auth.ts](src/config/auth.ts):
- client ID
- client secret
- email
- name
- roll number
- access code

The auth token is cached automatically and reused until it expires.

## Run Stage 1 Script
```bash
npx ts-node scripts/priority-inbox.ts --n=10
```

## Folder Structure
- scripts/: standalone Node.js utilities (priority inbox)
- src/app/: Next.js routes and layouts
- src/components/: reusable UI pieces
- src/context/: read/unread state management
- src/lib/: API calls and scoring logic
- src/types/: shared TypeScript types

## Priority Scoring Formula
Score is calculated as:

$$
\text{score} = \text{typeWeight} + \text{recencyScore}
$$

Type weights:
- Placement = 3
- Result = 2
- Event = 1

Recency score:

$$
\text{recencyScore} = 1 - \frac{\text{ageOfNotification\_ms}}{\text{ageOfOldestNotification\_ms}}
$$

The list is sorted by score in descending order and the top $N$ entries are shown in the priority inbox.
