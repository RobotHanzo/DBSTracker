# DBSTracker

DBSTracker is a real-time currency conversion tracking application. It tracks Forex rates between TWD (base currency) and USD/SGD using the DBS Bank Taiwan API.

## Features

- **Live Data**: Fetches the latest exchange rates every 5 minutes automatically.
- **24-Hour Price Change**: Dynamically calculates and displays the 24-hour percentage change.
- **Historical Charts**: Visualizes exchange rate history using Candlestick charts.
- **Time Intervals**: View charts by different bucket sizes (30m, 1h, 12h, 1d, 1w) or configure a completely custom interval.
- **Dark/Light Mode**: Full sleek responsive UI with automatic/manual theme toggling.
- **Database Backend**: Uses MongoDB (via Mongoose) to efficiently store and serve historical Forex records.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher recommended)
- `yarn` package manager
- MongoDB Database (Local or MongoDB Atlas)

### Environment Variables

Create a `.env` file in the root directory and configure your MongoDB connection and port:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/DBSTracker
```

### Local Development

1. **Install Dependencies**

   ```bash
   yarn install --frozen-lockfile
   ```

2. **Start the Development Server**
   ```bash
   yarn dev
   ```
   This will start both the Express backend and Vite frontend together in development mode.
   The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

1. **Build the Application**

   ```bash
   yarn build
   ```

   This builds the React frontend for production into the `dist` directory.

2. **Start the Production Server**
   ```bash
   yarn start
   ```
   This runs the Express server using the compiled outputs.

## Docker Deployment

You can easily package and run this application inside a Docker container:

```bash
docker run -p 3000:3000 -e MONGODB_URI="your_mongo_connection_string" -d --name dbstracker robothanzo/dbstracker:latest
```

Or should you want to modify the code and deploy your own copy:

### 1. Build the Docker Image

Run the following command in the project root:

```bash
docker build -t dbstracker .
```

### 2. Run the Docker Container

Once built, you can run the container and expose it on port 3000. Be sure to pass your MongoDB connection string as an environment variable:

```bash
docker run -p 3000:3000 -e MONGODB_URI="your_mongo_connection_string" -d --name dbstracker dbstracker
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 3. Automated Docker Hub Deployment (GitHub Actions)

A GitHub Actions workflow is included to automatically build and push the Docker image to Docker Hub whenever you push to the `main` branch.

To enable this:

1. Go to your GitHub repository **Settings** > **Secrets and variables** > **Actions**.
2. Add the following **Repository secrets**:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username.
   - `DOCKERHUB_TOKEN`: A Personal Access Token (PAT) from Docker Hub (with Read/Write permissions).
3. Push your code to the `main` branch. The action will automatically tag it as `latest` and push it to Docker Hub under your username as `dbstracker`.
