import Image from "next/image";
import Link from "next/link";
import { Button, Card, Badge } from "../components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
            </div>
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              DragBizz Store
            </h1>
            <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-6">
              Welcome to our beautiful store with advanced theme system
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="primary" className="text-lg px-4 py-2">
                Theme System Active
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Multiple Themes Available
              </Badge>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(var(--color-primary))] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Themes</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  Choose from Default, Ocean, Forest, and Sunset themes
                </p>
                <Button variant="outline" className="w-full">
                  Explore Themes
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-[rgb(var(--color-secondary))] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🌙</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Dark Mode</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  Toggle between light and dark variants for each theme
                </p>
                <Button variant="outline" className="w-full">
                  Try Dark Mode
                </Button>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  All components update instantly when you change themes
                </p>
                <Button variant="outline" className="w-full">
                  See Demo
                </Button>
              </div>
            </Card>
          </div>

          {/* Demo Section */}
          <Card className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-4">Theme Demo</h2>
              <p className="text-lg text-[rgb(var(--color-text-secondary))]">
                Experience our theme system in action
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Available Themes</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="font-medium">Default - Clean and professional</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <div className="w-4 h-4 rounded-full bg-sky-500"></div>
                    <span className="font-medium">Ocean - Calm and refreshing</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="font-medium">Forest - Natural and organic</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="font-medium">Sunset - Warm and vibrant</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">How to Use</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Click the theme selector in the bottom-right corner</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Choose your preferred theme from the dropdown</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[rgb(var(--color-primary))] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-[rgb(var(--color-text-secondary))]">Toggle dark mode for each theme</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Ready to Explore?</h2>
            <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
              Visit our theme demo page to see all themes in action
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/theme-demo">
                <Button variant="primary" size="lg">
                  View Theme Demo
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}