# SQL Quest with Lumi 🫧

A playful, pastel SQL course that takes a complete beginner to interview-ready. It's built for business analytics graduates heading into data analyst, business/BI analyst, product analyst and operations roles.

**Live site:** https://chaitalipatil06.github.io/SQL-Lumi/

Everything runs in the browser. Learners write real SQL against a small fictional company database (powered by [sql.js](https://github.com/sql-js/sql.js), SQLite compiled to JavaScript). There's no server and no sign-up.

## Features

- **16 chapters**: databases and keys → SELECT → WHERE → ORDER BY/LIMIT → GROUP BY/HAVING → JOINs → CASE and functions → subqueries and CTEs → window functions → business reports → INSERT/UPDATE/DELETE and transactions → CREATE TABLE, constraints, views and normalization → UNION/INTERSECT/EXCEPT, NULL traps and duplicates → dates and text → analytics patterns (funnels, cohort retention, gaps-and-islands, medians) → indexes, query plans, warehouse concepts and an interview method
- **A story for every chapter**: each topic opens at the fictional Lumi Health clinic. A colleague brings a real question, and the story explains *why* the concept exists, *when* you'd use it (with a healthcare analogy) and *how* it looks in SQL
- **176 practice challenges** (10–12 per chapter, easy → hard), each set in the clinic story and auto-graded
- **Skills Check at the end of every chapter**: 5 scored tasks (write queries plus concept questions). The skill report shows a score, a level (Getting started → Mastered), per-skill bars, strengths, and "work on next" links to the matching practice challenges. A skill profile on the home page tracks every chapter
- **Practice Gym**: 47 auto-graded problems (14 easy, 16 medium, 12 hard, and a 5-part business case study)
- **Mock interview**: 4 random problems against a 25-minute timer, with a results review
- **Try-it buttons** on every example, plus a playground with a live schema browser
- **Before → After view**: every query shows the source table next to the result. Kept rows are highlighted, filtered rows are faded, GROUP BY groups are colour-coded, the columns the query uses are marked, and INSERT/UPDATE/DELETE show added, changed and removed rows
- **Quizzes and auto-graded challenges** in every chapter, with hints and friendly error messages
- **Progress tracker**: a quest map, gems, ranks (Data Sprout → SQL Sage), a badge shelf and a progress bar, saved in the browser with a backup/restore code
- **A reward game every 2 chapters** (8 games), with a certificate at the end
- Practice data: a healthcare clinic database (`patients`, `doctors`, `appointments`, `prescriptions`, `lab_results`), a company database (departments, employees, customers, products, orders) plus product-analytics tables (`users`, `events`)
- **Lumi**, an original axolotl mascot, animated in hand-written SVG
- A role guide showing which chapters matter most for each target job

## Project structure

```
index.html        built, self-contained site (what GitHub Pages serves)
src/
  shell.html      page skeleton
  style.css       styles and animations
  content.js      chapters 1-10, quizzes, challenges, games
  content2.js     chapters 11-16 and the extra games
  gym.js          the 47 Practice Gym problems
  practice.js     chapter stories, 176 practice challenges and 16 skills checks
  clinic.sql      the Lumi Health clinic practice data
  app.js          app logic: router, playground, grading, games, progress
  gen_seed.py     generates the practice database
  seed.sql        generated practice data
  build.py        bundles src/ into index.html
tests/            Playwright end-to-end checks
```

## Develop

```bash
npm install            # fetches sql.js (only needed for the tests)
npm run build          # rebuilds index.html from src/
python3 tests/e2e_full.py   # solves all 16 chapters, all 47 gym problems and a mock interview
```

Open `index.html` in a browser to preview it. The SQL engine loads from a CDN, so you need an internet connection.

## Deploy

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
