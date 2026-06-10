# create-turbo-shadcn

Production-ready CLI for scaffolding Turborepo monorepos with shared shadcn/ui architecture and Tailwind CSS v4.

## Features

* Turborepo monorepo setup
* Shared shadcn/ui package
* Tailwind CSS v4 preconfigured
* Auto-generated barrel exports
* Automatic `@/` import fixing
* Shared UI across apps
* Retry + fallback support for shadcn registry issues
* Next.js apps included
* Monorepo-ready architecture

## Usage

```bash
npx create-turbo-shadcn my-app
```

## Local Development

```bash
git clone https://github.com/iamsoumikhazra/create-turbo-shadcn.git

cd create-turbo-shadcn

npm install

npm link
```

Test locally:

```bash
create-turbo-shadcn test-app
```

## License

MIT
