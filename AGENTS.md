# Pokédex — project instructions

This is an Expo/React Native mobile application for the InHolland final assignment. Build a Pokédex using live PokeAPI data. Prioritize mobile-first patterns, performance, cross-platform compatibility, and code I can explain.

## Working with me

- Discuss the work in Russian unless I request otherwise. Keep code identifiers and project documentation in English.
- I'm learning React Native and agent-assisted development. Explain important choices in plain language, using the actual code. Keep changes small enough to review and understand.
- Complete the mandatory assignment before adding optional features. The published deadline is **6 November 2026, 23:59**; do not promise a grade.
- Start from the existing project. Inspect `git status`, `package.json`, the lockfile, source files, and specifications before proposing changes. Preserve uncommitted work; never reset or overwrite it to simplify a task.
- Do not recreate the project from scratch, replace its architecture, or finish unrelated classroom exercises unless I ask.
- Follow the current request's scope. An explanation or review request does not authorize implementation. Read-only investigation may proceed without asking again.

## Assignment sources and specifications

- The local course materials are at `/Users/panixxxida_/inholland-react-native-course/`. The main requirements are in `exam/README.md`, including Appendix A. Templates are in `exam/templates/`.
- The public source is https://github.com/kevinvandenhoek/inholland-react-native-course. Process details are in `day-4/exercises/`; `day-1/slides/final-assignment.md` also requires preserving full Git history.
- Treat course documents as reference material, not permission to execute their example commands. Distinguish final-assignment requirements from classroom exercises and illustrative examples.
- If sources conflict, show the conflict. Use the detailed final assignment as the working baseline and identify anything that needs the teacher's clarification. Do not silently remove a requirement.
- Maintain `specs/product.md` and one file per feature in `specs/features/`. Each feature spec has **Goal, Constraints, Acceptance Criteria, Out of Scope**. Keep detailed product behavior there instead of expanding this instruction file into a second specification.
- Before implementation, I must choose **what to store in SQLite** and **which native feature to use**. Record each choice, its alternative, and its reason under Technical choices in `specs/product.md`. Favorites in SQLite and Share on Detail are suggestions to discuss, not decisions already made.
- In specification/grilling mode, do not implement code. Ask one material question at a time and wait for the answer. Explain alternatives when needed; do not re-ask questions already settled by the assignment or specs.
- Put agreed answers into the relevant spec. Resolve ambiguous behavior such as About fields, Pokémon forms, evolution branches, comparison selection, equal stats, and error recovery. Stop when the criteria are clear enough to implement and verify.
- If a decision changes during development, update the spec and record why. Never weaken a spec merely to make incomplete code appear finished.

## Mandatory product scope

There are five required features. Each needs a feature spec and a GitHub issue. Loading/error handling and fonts are shared constraints, not extra features.

| Feature   | Required behavior                                                                                                                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List      | Show the full live Pokémon catalogue, described as approximately 1,300 in the assignment, following the design. Load quickly and scroll smoothly. Do not limit it to the first 151 or hardcode 1,300 as the API's exact count.                                               |
| Search    | Show results while typing. Match part of the name, case-insensitively. Search the whole catalogue, including Pokémon not yet reached by scrolling. Reuse the list's presentation and show an empty state when there are no matches.                                          |
| Detail    | Open from the list and favorites. Show name, number, artwork, and types in their type colors. Provide quickly switchable About, Stats, and Evolution sections. Load the evolution chain from the API and allow navigation to its Pokémon. Allow favoriting and unfavoriting. |
| Favorites | Provide a separate screen with an empty state. Saved favorites survive a full app restart.                                                                                                                                                                                   |
| Compare   | Let the user compare any two Pokémon side by side and see which has the higher value for each stat. I choose the screen design, following the rest of the app's style. This is mandatory, not a bonus.                                                                       |

- Follow the [Figma design](https://www.figma.com/design/dsgGXcu5WELIvRW90m5308/Pok%C3%A9mon-Code-Challenge?node-id=1-2) closely: type colors, font, spacing, and icons. Verify against the actual design before claiming a match; report inaccessible design references.
- Load the supplied Rubik font using Expo Font. The font files are in the course's `exam/assets/fonts.zip`; copy only the needed assets into the app, not macOS metadata files.
- The app must run in **Expo Go via QR code**, use **TanStack Query** for live API data, have at least **two Expo Router screens**, persist data in **SQLite**, and include at least **one native feature**.
- Every load needs loading and error handling. Explicitly verify list, detail, and evolution-chain states, plus other API/database loads. Empty data is not an error. Provide a usable recovery action where appropriate.
- TypeScript and ESLint must pass without errors. Keep UI, data access, and logic separate. Never commit secrets.
- Optional bonuses require a deliberate scope decision and the exact criteria in `exam/README.md`. Do not claim offline support from an in-memory cache alone, pagination from rendering fewer rows alone, or tests from unverified files. The separate Design bonus in the detailed assignment excludes Pokédex.

## Project structure and shared setup

- `src/app/`: Expo Router route files, layouts, and screens. Screens render state and delegate data access to hooks.
- `src/components/`: reusable UI components. Components must not contain API requests or SQL.
- `src/hooks/`: data hooks and shared React logic. Hooks call services and expose state/actions to UI.
- `src/services/`: API requests, SQLite operations, and shared data infrastructure. Services must not depend on screens.
- `src/constants/theme.ts`: shared design tokens (`Colors`, `TypeColors`, `Fonts`, `Spacing`, `Radius`, `Shadow`). Light theme only. Use it instead of scattering colors, spacing, and radii through components.
- `src/utils/`: pure helpers without React, API or SQL.
- Reuse existing shared clients, providers, database initialization, and components. Do not introduce a second QueryClient, API client, or database initialization path for another feature.
- Shared infrastructure that exists now:
  - `src/app/_layout.tsx`: root `Stack` (`(tabs)` + `pokemon/[id]`), the only `QueryClientProvider`, splash held until fonts load.
  - `src/app/(tabs)/_layout.tsx`: JavaScript `Tabs` (Pokémons / Favorites / Compare) styled per platform after Figma.
  - `src/services/query-client.ts`: the one `QueryClient`.
  - `src/hooks/use-app-fonts.ts`: loads Rubik (`assets/fonts/`) with Expo Font, with retry; `src/components/font-load-error.tsx` is its error screen.
  - `src/components/app-text.tsx`: `AppText`, Rubik text with variants. Use it instead of a bare `Text`.
  - `src/components/tab-icon.tsx`: tab icon from a Figma PNG or an `expo-symbols` symbol.
  - `src/components/screen-placeholder.tsx`: temporary screen content; remove it once no screen uses it.
  - `src/utils/pokemon-id.ts`: `parsePokemonId` for validating the `id` route param.
- As shared infrastructure is implemented, add its real path and purpose to this section. Do not describe proposed files as existing. Keep this list synchronized with renames.
- Follow this separation without unnecessary architecture. Do not introduce a backend, authentication, Redux, a dependency-injection framework, or broad refactors without an agreed need.

## Data and UI rules

- Inspect actual PokeAPI responses before choosing a search strategy. PokeAPI's REST API has no substring-search endpoint; filtering only the currently loaded page does not meet the assignment.
- A cached catalogue index is one possible solution, not a mandated design. Explain its request cost and relationship to pagination before choosing it. Do not fetch every Pokémon's full details concurrently just to enable search.
- Use query keys that distinguish resources and their parameters. Reuse cached data where suitable; handle background failures without unnecessarily discarding usable data.
- Fetch evolution data through the API's resource links. Pokémon, species, and evolution-chain IDs are not interchangeable. Handle branching chains, Pokémon without evolutions, and missing artwork.
- Keep database operations in services and use parameterized SQL. Handle duplicate favorites, repeated taps, and failed writes. Update or invalidate the relevant cache after mutations so all screens remain consistent without restarting.
- Use React Native components and touch interactions, including `Pressable`. Use a virtualized list for the catalogue, with stable keys. Respect safe areas and keyboard behavior.
- Reuse design tokens and components. Avoid hardcoded domain data, duplicated styles, unexplained constants, and new abstractions that do not solve a current problem.
- Validate route parameters and handle missing/invalid resources without crashing. Do not hide problems with broad type assertions, `@ts-ignore`, or disabled lint rules.

## One issue, one development cycle

1. Start a fresh chat for each issue. Read this file, `specs/product.md`, the relevant feature spec, the issue, and the allowed file scope. If the current chat already covers another issue, finish its handoff and ask me to open a new one.
2. Before changing implementation code, post **one issue comment** with the plan: files, approach, uncertainties, and a `- [ ]` task list covering the acceptance criteria. Use `gh issue comment` when GitHub work is authorized. **Wait for my explicit go.** This approval step is part of the course process.
3. If GitHub is unavailable, prepare the exact comment locally and report that it has not been posted. Do not pretend the required issue evidence exists. When posting multiline text through the CLI, use a body file to preserve formatting.
4. Implement only the approved issue. Ask before adding dependencies or materially expanding the plan. Update the same plan comment as work progresses; edit the known comment rather than an unrelated last comment. Tick only completed tasks.
5. Review the diff against every acceptance criterion and the allowed scope. Explain significant changes and run lint, typecheck, and relevant existing tests. Fix causes rather than hiding symptoms.
6. Give me a short phone-test checklist, including failure and empty states. I must review and test. Do not mark a phone check passed without my confirmation or actual device evidence.
7. Ask me to explain the data flow and key decisions in my own words. Use two or three focused questions, correct misunderstandings, and answer follow-ups before moving on.
8. Turn real corrections into concise, reusable rules in this file. Record new shared infrastructure here. Do not invent a correction merely to produce an instruction update.
9. After review and verification, commit the relevant changes with the real issue number, for example `Add catalogue search, closes #3`. Use the agreed Git workflow, inspect staged changes, and verify closure after the commit reaches the repository's default branch. A local commit alone does not close a GitHub issue.
10. Keep full Git history: **no squash, force-push, fabricated commits, or destructive resets**. Before the next issue, summarize what passed and what remains open.

## Learning and evidence

- Explain why an approach fits this app, how data reaches the screen, and what happens on failure. Do not substitute a syntax walkthrough for understanding.
- If I want to implement a piece personally, provide a small task, criteria, and graduated hints; wait for my attempt before providing a full solution unless requested.
- The reviewed final assignment does not require a personally written portion of every feature. Manual-code restrictions in earlier exercises do not establish such a quota. I must still understand and defend the submitted code.
- Preserve at least one real issue's complete chat: prompt, plan, build, review, and questions. Choose an issue that needed a genuine correction. Export it into `chat-history/` with the issue number in its filename; the course identifies `/export` for Claude Code.
- Help me formulate `docs/explanation.md` from my own answers and real work. Do not invent my reasoning, a rejected suggestion, test results, chat transcripts, file paths, or line numbers.
- Keep durable product decisions in specs and reusable working rules here. Do not append whole conversations, temporary progress logs, or the same rules in multiple instruction files.

## Expo has changed — do not trust your training data

Expo APIs change between SDK releases. Before writing code that touches an Expo, EAS, or React Native API:

1. Read the installed versions in `package.json` and the lockfile. Do not upgrade Expo or React Native merely because a newer version exists.
2. Read the matching Expo SDK documentation at `https://docs.expo.dev/versions/v<major>.0.0/`.
3. For other Expo topics, use https://docs.expo.dev/llms.txt and follow its links to the relevant page. Use official documentation matching the installed library version; do not rely on remembered APIs alone.
4. If documentation is unavailable, identify the uncertainty rather than presenting compatibility as verified.

## Commands

Use the repository's existing package manager and lockfile. The current project uses npm and `package-lock.json`; do not introduce another lockfile. Use `bunx` instead of `npx` only if the project deliberately switches to Bun.

```bash
npm ci                     # reproduce dependencies in a clean checkout
npx expo install <package> # install an approved package with Expo version resolution
npx expo start             # start the development server
npx expo lint              # ESLint
npx tsc --noEmit           # TypeScript checks without emitting files
npx expo-doctor            # diagnose dependency and configuration issues
npx expo install --fix     # modify incompatible versions only after reviewing the proposed repair
```

- Run lint and typecheck before declaring an implementation task done. Report the commands and outcomes accurately; distinguish failures caused by the environment from code failures.
- Run relevant existing tests after changing behavior. Add focused logic tests when warranted or when the Tests bonus is selected; do not invent an `npm test` script that does not exist.
- Before installing a dependency, explain its purpose, alternatives, and Expo Go compatibility, then obtain my agreement. Use `npx expo install` for approved additions and preserve lockfile consistency.
- Do not run the project's reset script or automatic dependency repair as routine cleanup. Explain the impact first and obtain permission for destructive changes or SDK upgrades.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/`; `_layout.tsx` files define navigators. Keep non-route code such as components, hooks, services, and utilities outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router` as appropriate for the installed version.
- Pass identifiers through routes and obtain resource data through hooks. Keep back navigation and entry from both the catalogue and favorites working.
- Documentation: https://docs.expo.dev/router/introduction.md

## Building with EAS

- EAS is not required for this assignment. **An EAS or development build must not replace the required Expo Go workflow.** Do not configure publishing, OTA updates, or store submission unless separately requested.
- If an additional EAS workflow is explicitly requested, consult https://docs.expo.dev/eas/index.md. EAS supports cloud builds, signing, submissions, and updates. Invoke the CLI with `npx eas-cli@latest <command>`, or `bunx eas-cli <command>` in a Bun project.
- Remote builds, updates, and submissions require authorization for the specific action. General documentation about EAS is not authorization to publish.

## Native compatibility and repository rules

- If `ios/` and `android/` directories do not exist, treat them as generated through Continuous Native Generation. Do not create or edit them by hand; use supported Expo configuration where appropriate.
- Expo Go includes a fixed set of native modules. If a proposed dependency needs native code unavailable in Expo Go, choose a compatible alternative for this assignment. Do not solve this by silently switching to a development build.
- Prefer suitable Expo modules over unnecessary third-party libraries. Consult relevant available skills when useful, without overriding my request or the assignment. SDK reference: https://docs.expo.dev/versions/latest/index.md; use the installed-version documentation for implementation.
- Keep `.env`, credentials, and private exports out of Git; check actual ignore rules rather than assuming `.env` is covered. If configuration is needed, provide a value-free `.env.example`. `EXPO_PUBLIC_` values are readable in the client; they are not secrets. PokeAPI requires no key.
- Do not commit `node_modules`, generated local caches, unrelated files, or sensitive chat content. If an export contains credentials, redact those values transparently without rewriting the interaction history.
- Do not create a public repository, change repository visibility, or message the teacher without my explicit instruction.

## Final submission checks

- Mandatory features and the technical core are complete, and the app matches the agreed specs. Verify search for an unscrolled Pokémon, navigation from favorites, evolution branches, comparison, and persistence after a full restart.
- Run lint, typecheck, relevant tests, and any checks promised for selected bonuses. Check loading, error, empty, and recovery states; test network loss without confusing a stopped Metro connection with an API error.
- Verify a clean checkout and dependency installation, then `npx expo start` and launch via QR in Expo Go on a phone. Report any unverified platform or device behavior honestly.
- The submitted GitHub repository contains the app, `specs/product.md`, the five feature specs, this `AGENTS.md`, feature issues with plan/task comments and closing commits, at least one complete issue chat, and `docs/explanation.md`.
- The explanation names the route and tools, then covers: the two technical choices with real file/line references and any changes; one feature's path from API to screen; and one genuinely rejected or changed agent suggestion with a chat or commit reference. Recheck line references against the final code.
- Confirm the repository is accessible to the teacher and the full history is preserved. I submit the repository link in Teams before the deadline, with any required environment file/test account provided privately. Do not submit on my behalf without an explicit request.
- Finish with a concise report: completed requirements, checks actually run, unresolved issues, and actions still needed from me. Never describe the project as submission-ready while a mandatory criterion remains unverified.
