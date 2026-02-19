# Game Developer Assignment

A technical assignment built with web technologies.

## 🚀 Technologies

- **[PixiJS v8](https://pixijs.com/)**: Fast 2D WebGL renderer.
- **[GSAP](https://gsap.com/)**: Robust JavaScript animation library.
- **[Vite](https://vitejs.dev/)**: Blazing fast frontend build tool.
- **TypeScript**: Typed JavaScript.

## 🎮 Scenes Overview

The project consists of three distinct technical implementations accessible via the main menu:

### 1. Ace of Shadows
Demonstrates rendering and animation by managing **144 moving cards**.
- Features smooth card stack transitions.
- Optimized for consistent 60 FPS even on mobile.
- Responsive scaling for different screen sizes.

### 2. Magic Words
A responsive, scrollable dialogue system that handles mixed content.
- **Rich Text**: Supports a "Parsing Engine" that identifies emoji tokens (e.g., `{satisfied}`) within text strings.
- **Custom Emojis**: Dynamically replaces tokens with image assets.
- **Smooth Interaction**: Scrolling (drag and wheel) with GSAP.
- **Adaptive Layout**: Adjusts bubble width and avatar positioning based on screen size.

### 3. Phoenix Flame
A performant particle effect implementation.
- Utilizes `ParticleContainer` for efficient rendering of multiple sprites.
- Features dynamic alpha, scale, and jitter to simulate a vibrant fire effect.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Recommended version 18+)

### Installation

```bash
npm install
```

### Development

Run the project locally with hot-reload:

```bash
npm run dev
```

### Build

Build the project for production:

```bash
npm run build
```

## 📂 Project Structure

- `src/Core/`: Base application logic, scene management, and global event listeners.
- `src/Scenes/`: Individual implementation of each technical task.
- `public/`: Static assets (images, dialogue data).
- `docs/`: Production build output.
