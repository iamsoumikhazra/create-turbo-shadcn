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
* 🛠 Built-in `ui` shortcut command
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

# 📦 Usage

```bash
npx create-turbo-shadcn my-app
```

Or with other package managers:

```bash
pnpm create turbo-shadcn my-app
yarn create turbo-shadcn my-app
bun create turbo-shadcn my-app
```

Or explicitly:

```bash
create-turbo-shadcn my-app -p npm
create-turbo-shadcn my-app -p pnpm
create-turbo-shadcn my-app -p yarn
create-turbo-shadcn my-app -p bun
```

---

# 🚀 Start Development

```bash
cd my-app
npm run dev     # npm
yarn dev        # yarn
pnpm dev        # pnpm
bun dev         # bun
```

---

# 🧩 Add shadcn Components

```bash
npm run ui accordion     # npm
yarn ui accordion        # yarn
pnpm ui accordion        # pnpm
bun ui accordion         # bun
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
└── [lockfile]
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
npm run ui sheet         # npm
yarn ui sheet            # yarn
pnpm ui sheet            # pnpm
bun ui sheet             # bun
```

Then use anywhere:

```tsx
import { Sheet } from "@repo/ui";
```

---

# ⚙ CLI Options

## Auto-detection

The package manager is automatically detected from the parent command:

```bash
pnpm create turbo-shadcn my-app    # auto-detects pnpm
yarn create turbo-shadcn my-app    # auto-detects yarn
bun create turbo-shadcn my-app     # auto-detects bun
npx create-turbo-shadcn my-app     # auto-detects npm
```

## Help

```bash
npx create-turbo-shadcn --help
```

## Version

```bash
npx create-turbo-shadcn --version
```

## Package Manager (explicit)

```bash
npx create-turbo-shadcn my-app -p pnpm
npx create-turbo-shadcn my-app -p yarn
npx create-turbo-shadcn my-app -p bun
npx create-turbo-shadcn my-app -p npm
```

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
npm link --force
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
* [x] Bun support
* [ ] React Native templates
* [ ] Authentication templates

---

# 🤝 Contributing

PRs, issues, and feature requests welcome.

---

# 📄 License

MIT License © 2026 Soumik Hazra
