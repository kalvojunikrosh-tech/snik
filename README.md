# Snik

A modern web application built with Node.js and integrated with Google's Gemini API for intelligent features.

## Overview

Snik is a full-featured application designed for local development and deployment. It provides a seamless setup experience with minimal configuration required.

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- A valid Gemini API key

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kalvojunikrosh-tech/snik.git
cd snik
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

You can obtain your API key from [Google Gemini](https://gemini.google.com).

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the configured port).

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm start` - Start the production server

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

## Project Structure

```
snik/
├── public/          # Static assets
├── src/             # Source code
├── .env.local       # Environment variables (not in version control)
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Deployment

For production deployment, ensure all environment variables are properly configured on your hosting platform.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/kalvojunikrosh-tech/snik).
