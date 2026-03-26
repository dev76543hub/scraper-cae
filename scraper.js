const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = process.env.PORT || 3000;

// Lista de bancos
const bancos = [
  'BancoEstado','Santander','BCI','Banco Internacional','Banco Falabella','Banco BICE',
  'Capual','Scotiabank','Coopeuch','Banco Consorcio','CCAF Los Andes','Ahorrocoop',
  'Oriencoop','CCAF Los Heroes','Banco Chile'
];

app.get('/cae', async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.sernac.cl/portal/619/w3-article-84607.html', { waitUntil: 'networkidle' });

    let resultado = {};

    for (let banco of bancos) {
      // Aquí debes ajustar el selector según la estructura HTML de SERNAC
      const elem = await page.$(`text=${banco} >> xpath=../following-sibling::td`);
      if (elem) {
        let text = await elem.innerText();
        let cae = parseFloat(text.replace('%',''));
        resultado[banco] = cae;
      } else {
        resultado[banco] = null;
      }
    }

    await browser.close();
    res.json(resultado);
  } catch(e) {
    console.error(e);
    res.status(500).send('Error scraping CAE');
  }
});

app.listen(port, () => console.log(`Scraper listening on port ${port}`));