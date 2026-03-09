# Pavan Kumar Portfolio

A responsive, static personal portfolio website showcasing my skills, qualifications, services, projects, and testimonials. The website is built with HTML, CSS, JavaScript, and integrates various 3D and dynamic elements using modern libraries like Three.js and GSAP.

## Features

- **Responsive Design**: Built to adapt beautifully across mobile, tablet, and desktop screens.
- **Dynamic 3D Elements**: Includes a 3D Skills visualization and a 3D Sphere Carousel for testimonials using Three.js and GSAP.
- **Interactive UI**: Fluid scroll animations, glassmorphism UI overlays, and hover effects.
- **Contact Form**: Integrated contact form with embedded Google Maps API and email integration.

## How to Run Locally

This is a static website consisting of pure HTML, CSS, and client-side JavaScript. It does **not** rely on a backend framework like React or Next.js, and therefore it **does not use a `package.json` file or `npm start` command**.

To run this application locally and view the 3D features correctly, you need to serve the files through a local HTTP server (this avoids CORS issues with loading images and modules).

### Recommended Methods

#### Method 1: Using Node.js \`serve\` (If you have Node.js installed)
Simply open your terminal in the root directory of this project and run:
```bash
npx serve .
```
Then, open your browser and navigate to `http://localhost:3000` (or whichever port the command outputs).

#### Method 2: VS Code Live Server Extension
1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Open `index.html` and click the "Go Live" button in the bottom right corner of the VS Code window (or right-click in `index.html` and select "Open with Live Server").
4. A browser window will automatically open with your website.

#### Method 3: Using Python (If you have Python installed)
Open your terminal in the root directory and run:
```bash
python -m http.server 8000
```
Then, navigate to `http://localhost:8000` in your browser.

## Technologies Used
- HTML5 / CSS3 / JavaScript
- [Three.js](https://threejs.org/) (for 3D visual environments)
- [GSAP](https://gsap.com/) (for smooth animations)
- Swiper.js (for previous sliders)
- Unicons (Icons)
