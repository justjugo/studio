# TCF Prep App

This is a Next.js application designed to help users prepare for the Test de Connaissance du Français (TCF). It includes training modules, practice tests, and progress tracking, all powered by Firebase.

This project was bootstrapped with Firebase Studio.

## Running the Project Locally

To get this project up and running on your local machine, follow these steps. You will need to have [Node.js](https://nodejs.org/) (v18 or later) installed on your system.

### 1. Install Dependencies

Open your terminal or command prompt, navigate to the root directory of the project, and run the following command to install the necessary packages:

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, you can start the Next.js development server:

```bash
npm run dev
```

This will start the application in development mode. You can view it by opening [http://localhost:9002](http://localhost:9002) in your browser.

The app will automatically reload if you make any changes to the source files.

## Publishing Your Project to GitHub

To store your project on GitHub and track its history, follow these steps.

### 1. Initialize a Git Repository

If you haven't already, initialize a Git repository in your project's root folder.

```bash
git init -b main
```

### 2. Add and Commit Your Files

Add all your project files to the repository's tracking index and create an initial commit.

```bash
git add .
git commit -m "Initial commit of my TCF Prep App"
```

### 3. Create a New Repository on GitHub

1.  Go to [GitHub.com](https://github.com) and log in.
2.  Click the **+** icon in the top-right corner and select **"New repository"**.
3.  Give your repository a name (e.g., `tcf-prep-app`).
4.  Choose whether you want the repository to be public or private.
5.  **Important**: Do **not** initialize the new repository with a `README` or other files. It needs to be empty.
6.  Click **"Create repository"**.

### 4. Link Your Local Project to GitHub

After creating the repository on GitHub, the page will display a URL. Copy it. Then, run the following command in your terminal, replacing the URL with your repository's URL.

```bash
git remote add origin https://github.com/your-username/your-repository-name.git
```

### 5. Push Your Code to GitHub

Finally, push your committed code from your local `main` branch to the `origin` remote on GitHub.

```bash
git push -u origin main
```

Your project is now live on GitHub! You can continue to commit changes and push them as you develop your application.
