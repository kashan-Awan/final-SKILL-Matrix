# Dawlance Internship Skills Matrix
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/AlphaAnas/Dawlance-Internship-Skills-Matrix)

## Overview

This repository contains the Skills Matrix Portal developed for Dawlance, a comprehensive web application designed to manage and analyze employee skills within a manufacturing environment. The portal provides tools for creating, viewing, and managing skills matrices, tracking employee performance, and gaining data-driven insights through an interactive dashboard and an AI-powered chatbot.

The application is built with a modern technology stack, featuring a Next.js frontend, a MySQL database, and integration with the Google Gemini API for advanced analytics.

## Key Features

*   **Employee Management:** View a comprehensive list of all employees, their departments, skill counts, and detailed skill profiles.
*   **Interactive Dashboard:** A central landing page with key metrics, including total employees, department distribution, skill level breakdowns, gender diversity stats, and department performance trends.
*   **Skills Matrix Builder:** A step-by-step wizard to create new skills matrices by selecting departments, employees, and relevant skills. Update and manage employee skill levels directly within the matrix.
*   **Skills Mapping:** Visualize and manage existing skills matrices, with filtering options by department and search functionality.
*   **AI Employee Assistant:** An intelligent chatbot integrated with Google's Gemini API that provides instant insights into employee data. It can answer queries about top performers, skill distribution, diversity, and more.
*   **Department Performance Analytics:** Track and compare department performance over time based on aggregated employee skill scores.
*   **User Roles & Permissions:** Supports different user roles (Admin, Manager, User) with specific permissions for accessing and managing data.
*   **Database Seeding & Health Checks:** Includes scripts to easily populate the database with sample manufacturing data and to verify system health.

## Technology Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (with App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
*   **Backend:** [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
*   **Database:** [MySQL](https://www.mysql.com/) with [mysql2](https://github.com/sidorares/node-mysql2)
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/) via `@google/generative-ai` SDK
*   **Charts & Visualization:** [Recharts](https://recharts.org/)

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

*   Node.js (v18 or later)
*   pnpm (or your preferred package manager)
*   MySQL server running locally (or a remote MySQL instance).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alphaanas/dawlance-internship-skills-matrix.git
    cd dawlance-internship-skills-matrix
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables.

    ```bash
    # MySQL connection settings
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=dawlance_skills_matrix

    # Google Gemini API Key for the AI Chatbot (optional)
    # Get your key from https://makersuite.google.com/app/apikey
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Seed the database:**
    To populate your database with sample manufacturing data, run the seed script.
    ```bash
    pnpm run seed-db
    ```
    This script will drop existing collections and insert new sample data for departments, employees, skills, etc.

5.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

The application will be available at `http://localhost:3000`. You can log in with any credentials, selecting the desired role (User, Manager, or Admin) on the login page.

## Project Structure

The project follows the Next.js App Router structure:

*   `app/api/`: Contains all backend API endpoints for data fetching and manipulation.
*   `app/components/`: Shared React components used across the application.
*   `app/(pages)/`: Different pages of the application (e.g., `/employees`, `/skills-mapping`).
*   `hooks/`: Custom React hooks for data fetching and managing client-side state.
*   `lib/`: Core utilities, including MySQL connection (`mysql.ts`), TypeScript model interfaces (`/models`), and the database seeding script (`seedDatabase.ts`).
*   `public/`: Static assets like images and SVGs.
*   `scripts/`: Standalone scripts, such as the `health-check.js` script.

## Available Scripts

*   `pnpm run dev`: Starts the development server.
*   `pnpm run build`: Creates a production build of the application.
*   `pnpm run start`: Starts the production server.
*   `pnpm run seed-db`: Seeds the database with sample data via the `/api/seed-database` endpoint.
*   `pnpm run health-check`: Runs a script to check the health of all API endpoints and the database connection.
