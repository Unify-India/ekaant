# Instructions
- Do not assume changes, always ask user with change proposal.
- Do not test shell commands automatically, give proposal to user for confirmation then start planning.
- Ask doubts in case the instructions are not clear
- Never edit the environment files
- If user has any doubt then clear the doubt don't update code
- First brainstorm and take a confirmation for the plan
- While coding use latest syntax for Ionic version 7 and angular version 20 (directives with '@' and many more things)
- if needed consult firebase mcp server extension that is attached for your help and better clarity 

## Commit Strategy
When asked to commit changes, follow this strategy:
1.  **Granularity:** Commit one file or one logical component at a time. Do not group unrelated files.
2.  **Limit:** Do not include more than 2 files in a single commit unless they are tightly coupled (e.g., `.ts`, `.html`, `.scss` for the same component).
3.  **Message Format:** Use the conventional commit format: `<type>: <message in 100 chars>`.
    -   Types: `feat` (new feature), `fix` (bug fix), `refactor` (code change that neither fixes a bug nor adds a feature), `style` (formatting, missing semi colons, etc; no production code change), `chore` (updating build tasks, package manager configs, etc).
    -   Message: Concise, lowercase description of the change.

# Project Context Saved (November 5, 2025)

This document summarizes the current state of the Ekaant project and the ongoing development plan, as discussed with the Gemini CLI agent.

## 1. Project Overview

- **Project Name:** Ekaant
- **Goal:** Mobile-first platform for library management, focusing on self-study cubicles and book lending in the Indian market. USP: Monetizing unused (no-show) cubicle slots by auto seat allocation and enhancing manager experience by payment notification and analytics.
- **Story**: Ekaant is an innovative Minimum Viable Product (MVP) application designed to streamline library operations, specifically targeting the management of self-study cubicle reservations and the traditional system of book lending in India. Recognizing the challenge libraries face with underutilized booked spaces, delayed payments, over-consumption of resources. Ekaant introduces a core innovation: the ability to monetize 'no-show' study cubicles, transforming idle space into additional income. Simultaneously, it provides students with a seamless and user-friendly platform to discover and book their ideal quiet study areas, fostering focus and productivity. It has 3 user roles and many module for each role which can be found in project menu data.
- **Tech Stack:** Ionic (Angular v20) for Frontend, Firebase (Firestore, Authentication, Storage, Cloud Functions) for Backend, Capacitor for Native Builds.
- **User Roles:** Student, Library Manager, Admin.
- 

## 2. Recent Progress

### a. Documentation Updates

- **`docs/plan/frontend.md`:** Updated to include:
  - "Implementation Status" for each feature in the "Project Feature List".
  - "Status & Path" for each page in the "Pages and Views Involved" section.
  - A new section for "Shared Components".
  - A new section "Brainstorming & Future Enhancements" with ideas for No-Show Monetization, Enhanced Manager Analytics, and Student Gamification.
  - A new section "Pending MVP Features by Role" outlining specific features to be implemented for Admin, Manager, and Student roles.
- **`docs/db schema.md`:** Updated to include:
  - A more detailed `users` collection schema with `role`, `profileCompleted`, `verified` fields.
  - A new `libraryRegistrationRequests` collection to store pending library applications.
  - A refined `libraries` collection schema for approved libraries, designed for efficient reading.
  - A new `studentApplications` collection for managing student applications to libraries.
- **`functions/plan.md`:** Updated to include the auto seat allocation for student in given slot according to pricing plan. 
Check respective the doc for more details