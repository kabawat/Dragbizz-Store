"use client"
import React from 'react';
import { Button, Card, Input, Badge } from '@/components/ui';

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-text-primary))] transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              DragBizz Store Theme System
            </h1>
            <p className="text-lg text-[rgb(var(--color-text-secondary))]">
              Experience our beautiful theme system with multiple color schemes and dark/light modes
            </p>
          </div>

          {/* Theme Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Card Demo */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Card Component</h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                  Beautiful cards that adapt to your theme
                </p>
                <Badge variant="primary">Theme Aware</Badge>
              </div>
            </Card>

            {/* Button Demo */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Button Variants</h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">Primary</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                </div>
              </div>
            </Card>

            {/* Input Demo */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">Form Elements</h3>
                <div className="space-y-3">
                  <Input 
                    placeholder="Enter your name"
                    label="Name"
                  />
                  <Input 
                    placeholder="Enter your email"
                    label="Email"
                    type="email"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Color Palette Display */}
          <Card className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Current Theme Colors</h2>
              <p className="text-[rgb(var(--color-text-secondary))]">
                These colors automatically change based on your selected theme
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: 'rgb(var(--color-primary))' }}
                />
                <p className="text-sm font-medium">Primary</p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
                />
                <p className="text-sm font-medium">Secondary</p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md border-2"
                  style={{ backgroundColor: 'rgb(var(--color-bg-primary))', borderColor: 'rgb(var(--color-border-primary))' }}
                />
                <p className="text-sm font-medium">Background</p>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: 'rgb(var(--color-bg-secondary))' }}
                />
                <p className="text-sm font-medium">Surface</p>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card variant="filled">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">How to Use</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h3 className="font-semibold mb-2">1. Choose Theme</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Click the theme selector in the bottom-right corner to choose from Default, Ocean, Forest, or Sunset themes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Toggle Dark Mode</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Use the dark mode toggle in the theme selector to switch between light and dark variants.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Automatic Updates</h3>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    All components automatically adapt to your theme choice with smooth transitions.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
