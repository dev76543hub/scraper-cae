// scraper-sernac.js
const express = require('express');
const { chromium } = require('playwright'); // Chromium headless
const app = express();

const PORT = process.env.PORT || 3000;
const SERNAC_URL = 'https://www.sernac.cl/portal/619/w3-article-84607.html';

app.get('/cae', async (req, res) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(SERNAC_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Esperar a que la tabla cargue
    await page.waitForSelector('table', { timeout: 15000 });

    // Extraer todos los bancos y CAE
    const data = await page.$$eval('table tr', rows => {
      return rows.slice(1) // saltar encabezado
        .map(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            return {
              banco: cells[0].innerText.trim(),
              cae: cells[1].innerText.trim().replace('%','')
            };
          }
          return null;
        })
        .filter(x => x !== null);
    });

    res.json({ success: true, bancos: data });
  } catch (err) {
    console.error('Error scraping CAE:', err.message);
    res.status(500).json({ success: false, message: 'Error scraping CAE' });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Scraper SERNAC corriendo en puerto ${PORT}`));