# Graph Report - calling  (2026-06-18)

## Corpus Check
- 76 files · ~47,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 368 nodes · 541 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `61d73831`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `useSelectedConversation()` - 15 edges
2. `useAuthStore` - 12 edges
3. `useChatStore` - 11 edges
4. `What You Must Do When Invoked` - 11 edges
5. `/graphify` - 10 edges
6. `graphify reference: extra exports and benchmark` - 8 edges
7. `User` - 7 edges
8. `useWallpaper()` - 7 edges
9. `withTransform()` - 7 edges
10. `upsertUserFromClerkProfile()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useAuthStore`  [EXTRACTED]
  frontend/vite-project/src/App.jsx → frontend/vite-project/src/store/useAuthStore.js
- `ChatPage()` --calls--> `useWallpaper()`  [EXTRACTED]
  frontend/vite-project/src/pages/ChatPage.jsx → frontend/vite-project/src/context/WallpaperContext.jsx
- `sendFriendRequest()` --calls--> `emitToUser()`  [EXTRACTED]
  backend/src/controllers/message.controller.js → backend/src/lib/socket.js
- `acceptFriendRequest()` --calls--> `emitToUser()`  [EXTRACTED]
  backend/src/controllers/message.controller.js → backend/src/lib/socket.js
- `sendMessage()` --calls--> `hasImageKitConfig()`  [EXTRACTED]
  backend/src/controllers/message.controller.js → backend/src/lib/imagekit.js

## Import Cycles
- None detected.

## Communities (29 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (20): acceptFriendRequest(), getConversationsForSidebar(), getMessages(), getUsersForSidebar(), sendFriendRequest(), sendMessage(), createFilename(), hasImageKitConfig() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (22): AvatarWithOnlineIndicator(), ChatComposer(), ChatHeader(), ChatSidebar(), mapUserForList(), ConversationRow(), MessageList(), NoConversationPlaceholder() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (24): AuthActionPanel(), continueButtonClassName, logoTileClassName, AuthCardShell(), cardClassName, AuthHeader(), AuthHeroPanel(), heroImageClassName (+16 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (25): dependencies, axios, @clerk/clerk-react, @heroui/react, @heroui/styles, lucide-react, react, react-dom (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (26): devDependencies, eslint, @eslint/js, eslint-plugin-react-dom, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-react-x, globals (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (23): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (20): dependencies, bcryptjs, @clerk/clerk-sdk-node, @clerk/express, cookie-parser, cors, cron, dotenv (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): ThemePresetPicker(), ThemeToggle(), applyThemePresetToDocument(), isValidThemePreset(), PRESET_IDS, readStoredThemePreset(), ThemeContext, ThemeProvider() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): author, description, devDependencies, cpx, nodemon, rimraf, keywords, license (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (10): Backend, Backend (`/backend`), Bulbul, Deployment, 🧪 Environment Variables, Frontend, Frontend (`/frontend`), 💬 Full Stack Real-Time Chat App 🚀 (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (25): buildFallbackEmail(), buildFallbackProfile(), buildUsername(), checkAuth(), createUniqueUsername(), getClerkUserProfile(), resolveEmail(), syncAllClerkUsers() (+17 more)

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 12 - "Community 12"
Cohesion: 0.57
Nodes (5): MessageBubble(), buildPosterUrl(), MessageVideo(), isImageKitUrl(), withTransform()

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (10): dependencies, svix, devDependencies, autoprefixer, eslint-plugin-react-dom, eslint-plugin-react-x, postcss, tailwindcss (+2 more)

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 15 - "Community 15"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (11): dependencies, axios, @clerk/clerk-react, @heroui/react, lucide-react, react, react-dom, react-hot-toast (+3 more)

## Knowledge Gaps
- **169 isolated node(s):** `name`, `version`, `description`, `type`, `main` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 6` to `Community 8`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1032258064516129 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1346153846153846 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08974358974358974 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._