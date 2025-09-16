# DragBizz Store Frontend

Hey! This is our DragBizz Store frontend project. It's built with Next.js and we're using it to create a cool online store.

## How to Run This Project

First, make sure you have Node.js installed on your computer. Then follow these steps:

1. Open your terminal and go to this project folder
2. Install all the packages:
   ```bash
   npm install
   ```
   or if you prefer yarn:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   or with yarn:
   ```bash
   yarn dev
   ```

4. Open your browser and go to `http://localhost:3000`

That's it! You should see our DragBizz Store running.

## What's Inside This Project

- **Next.js** - The main framework we're using
- **React** - For building the user interface
- **Tailwind CSS** - For styling everything
- **Custom Components** - We made our own UI components
- **Authentication** - Login and register functionality
- **API Integration** - Connects to our backend server

## Project Structure

```
src/
├── app/           # Main app pages
├── components/    # Reusable UI components
├── config/        # App configuration
├── service/       # API calls and HTTP requests
├── utils/         # Helper functions
└── style/         # CSS files
```

## Environment Setup

Before running the project, you need to create a `.env.local` file in the root directory with these variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=DragBizz Store
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
NEXT_PUBLIC_REFRESH_TOKEN_KEY=refreshToken
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the project for production
- `npm run start` - Start production server
- `npm run lint` - Check code for errors

## Need Help?

If you're stuck or have questions:
1. Check the component documentation in `src/components/ui/README.md`
2. Look at the service documentation in `src/service/README.md`
3. Check the config documentation in `src/config/README.md`

## Contributing

If you want to add new features or fix bugs:
1. Create a new branch
2. Make your changes
3. Test everything works
4. Create a pull request

That's all! Happy coding! 🚀
