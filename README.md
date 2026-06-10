![npm](https://img.shields.io/npm/v/create-turbo-shadcn)
![downloads](https://img.shields.io/npm/dm/create-turbo-shadcn)
![license](https://img.shields.io/npm/l/create-turbo-shadcn)
# 🚀 create-turbo-shadcn

Production-ready CLI for scaffolding scalable Turborepo monorepos with shared `shadcn/ui`, Tailwind CSS v4, and modern workspace architecture.

Build reusable UI systems once. Share everywhere.

---

# ✨ Features

* ⚡ Turborepo monorepo setup
* 🎨 Tailwind CSS v4 preconfigured
* 🧩 Shared `shadcn/ui` package
* 🔄 Shared UI architecture
* 📦 Workspace-ready setup
* 🛠 Built-in `ui:add` command
* 🚀 Next.js apps included
* 🧠 Auto configuration
* 📚 Shared component exports
* 🧱 Monorepo-first structure
* 🔥 Fast scaffolding experience
* 🛠 Automatic `@/` import fixing
* 🔁 Retry + fallback support for shadcn registry issues
* 📦 Auto-generated barrel exports
* 🌍 Multi-package-manager support

---

# 📦 Package Managers

## npm

```bash
npx create-turbo-shadcn my-app
```

---

## Yarn

```bash
yarn create turbo-shadcn my-app
```

---

## pnpm

```bash
pnpm create turbo-shadcn my-app
```

---

# 🚀 Start Development

```bash
cd my-app
yarn dev
```

or

```bash
pnpm dev
```

or

```bash
npm run dev
```

---

# 🧩 Add shadcn Components

```bash
yarn ui:add accordion
```

```bash
yarn ui:add dialog
```

```bash
yarn ui:add dropdown-menu
```

```bash
yarn ui:add toast
```

```bash
yarn ui:add sheet
```

---

# 📁 Generated Project Structure

```txt
my-app/
├── apps/
│   ├── docs/
│   │   ├── app/
│   │   └── package.json
│   │
│   └── web/
│       ├── app/
│       └── package.json
│
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   │
│   └── ui/
│       ├── src/
│       │   ├── components/
│       │   │   └── ui/
│       │   │
│       │   ├── lib/
│       │   │   └── utils.ts
│       │   │
│       │   ├── styles/
│       │   │   └── globals.css
│       │   │
│       │   └── index.ts
│       │
│       ├── components.json
│       ├── package.json
│       └── scripts/
│           └── shadcn-add.mjs
│
├── turbo.json
├── package.json
└── yarn.lock
```

---

# 🧠 Shared UI Architecture

All shared components live inside:

```txt
packages/ui
```

Every app imports directly from shared package:

```tsx
import { Button } from "@repo/ui";
```

This enables:

* reusable design systems
* centralized UI management
* scalable monorepo workflows
* consistent component architecture
* shared design tokens
* reusable component libraries

---

# 📚 Using Components Inside Next.js Apps

Example inside:

```txt
apps/web/app/page.tsx
```

```tsx
import { Button } from "@repo/ui";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <Button>
        Click Me
      </Button>
    </main>
  );
}
```

---

# 🎨 Add New Components

```bash
yarn ui:add sheet
```

Then use anywhere:

```tsx
import { Sheet } from "@repo/ui";
```

---

# ⚙ CLI Options

## Help

```bash
npx create-turbo-shadcn --help
```

---

## Version

```bash
npx create-turbo-shadcn --version
```

---

## Package Manager

```bash
npx create-turbo-shadcn my-app --package-manager pnpm
```

---

## Skip Install

```bash
npx create-turbo-shadcn my-app --no-install
```

---

# 🛠 Local Development

Clone repository:

```bash
git clone https://github.com/iamsoumikhazra/create-turbo-shadcn.git
```

```bash
cd create-turbo-shadcn
```

Install dependencies:

```bash
npm install
```

Link CLI locally:

```bash
npm link
```

Test locally:

```bash
create-turbo-shadcn test-app
```

---

# 🧱 Tech Stack

* Turborepo
* Next.js
* shadcn/ui
* Tailwind CSS v4
* Commander.js
* Execa
* fs-extra
* Node.js

---

# 🛣 Roadmap

* [ ] Full TypeScript rewrite
* [ ] Interactive prompts
* [ ] Template system
* [ ] Web3 templates
* [ ] Prisma integration
* [ ] Drizzle integration
* [ ] Storybook support
* [ ] Docker support
* [ ] Biome support
* [ ] Remote template registry
* [ ] AI-assisted scaffolding
* [ ] Bun support
* [ ] React Native templates
* [ ] Authentication templates

---

# 🤝 Contributing

PRs, issues, and feature requests welcome.

---

# 📄 License

MIT License © 2026 Soumik Hazra
