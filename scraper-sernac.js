import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

async function scrapeCAE() {
    try {
        // Ejemplo: abrir página de BancoEstado
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // Cambia esto por la URL real de los datos de SERNAC/Power BI que necesites
        const url = 'https://wabi-paas-1-scus-api.analysis.windows.net/public/reports/querydata?synchronous=true';

        // POST a la API de Power BI
        const body = {
            // Ajusta según el request que viste en DevTools
            // "queries": [...], etc.
        };

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        await browser.close();

        // Aquí extraes el CAE de cada banco del JSON
        const caePorBanco = {}; // { "BancoEstado": "36.88%", ... }

        // Ejemplo dummy, reemplaza con lógica real:
        caePorBanco["BancoEstado"] = data?.results?.[0]?.result?.data?.DSR || "0%";

        return { success: true, data: caePorBanco };
    } catch (error) {
        console.error("Error scraping CAE:", error);
        return { success: false, message: "Error scraping CAE" };
    }
}

app.get('/', async (req, res) => {
    const result = await scrapeCAE();
    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Scraper SERNAC corriendo en puerto ${PORT}`);
    console.log(`==> Your service is live 🎉`);
});