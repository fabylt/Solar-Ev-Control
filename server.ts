import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Add a simple health check API endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production (when running in Docker/Add-on), serve the built static files
    const distPath = path.join(process.cwd(), 'dist');
    // Important for Ingress: Home Assistant mounts the add-on on a dynamic base path, 
    // although Ingress usually rewrites paths transparently. 
    // Express static handles this fine if paths are relative.
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
