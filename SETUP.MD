# DragBizz Store setup

## Step: 1 — Requirements

Requires Node.js 22 and Yarn 1.22. Keep `../dragorbit` beside this repository.

## Step: 2 — Install dependencies

Install dependencies:

```bash
cd ../dragorbit
yarn install
cd ../Dragbizz-Store
yarn install
```

## Step: 3 — Configure the env file

Copy `env.example` to `.env.local` and configure the API URL, Google/Firebase settings needed by this app.

## Step: 4 — Start development

Start the required backend services, then run:

```bash
yarn dev
```

Open `http://localhost:3001`.

## Step: 5 — Build production

For production, configure the target environment before building:

```bash
yarn build
yarn start
```

Keep DragOrbit available during builds. Public env values are bundled at build time. Run `yarn lint` for code checks.
