# DBSTracker

DBSTracker is a real-time currency conversion tracking application. It tracks Forex rates between TWD (base currency) and USD/SGD using the DBS Bank Taiwan API.

## Features

- **Live Data**: Fetches the latest exchange rates every 5 minutes automatically.
- **Historical Charts**: Visualizes exchange rate history using Candlestick charts (powered by Recharts).
- **Time Intervals**: View charts by different bucket sizes (5m, 15m, 1h).
- **Dark/Light Mode**: Full sleek responsive UI with automatic/manual theme toggling.
- **Local Database**: Built-in SQLite database (`better-sqlite3`) to efficiently store and serve historical Forex records.

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- `npm` or `yarn`

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```
   *(or `yarn install` if preferred)*

2. **Start the Development Server**
   ```bash
   npm run dev
   ```
   This will start both the Express backend and Vite frontend together in development mode.
   The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

1. **Build the Application**
   ```bash
   npm run build
   ```
   This builds the React frontend for production into the `dist` directory.

2. **Start the Production Server**
   ```bash
   npm start
   ```
   This runs the Express server using the compiled outputs.

## Docker Deployment (Easy Container Building)

You can easily package and run this application inside a Docker container.

### 1. Build the Docker Image

Run the following command in the project root:
```bash
docker build -t dbstracker .
```

### 2. Run the Docker Container

Once built, you can run the container and expose it on port 3000:
```bash
docker run -p 3000:3000 -d --name dbstracker-app dbstracker
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

*Note: The SQLite database file (`currency.db`) is stored locally inside the container at `/app/currency.db`. For persistent data storage across container restarts, consider mounting a Docker volume to the application directory.*
