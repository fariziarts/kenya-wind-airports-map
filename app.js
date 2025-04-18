
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/maptiler-key', (req, res) => {
  res.json({ apiKey: process.env.MAPTILER_API_KEY });
});

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Wind Layer Visualization'
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
