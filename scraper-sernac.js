import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', async (req, res) => {
  try {
    // Petición al endpoint de Power BI
    const response = await fetch('https://wabi-paas-1-scus-api.analysis.windows.net/public/reports/querydata?synchronous=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({
        // Este body se puede ajustar según los datos que viste en DevTools
        version: 1,
        queries: [
          {
            query: "dataset", // Ajusta según tu estructura JSON si es necesario
          },
        ],
        modelId: "reportModelId" // Ajusta según el ID real del reporte
      })
    });

    if (!response.ok) throw new Error('Error al consultar Power BI');

    const data = await response.json();

    // Aquí hay que mapear los datos JSON al formato de bancos
    // 🔹 Este ejemplo asume que los CAEs vienen en data.results[0].result.data.DS[0].PH[0].DM0[0].S
    // Debes inspeccionar tu JSON real y ajustar las rutas
    const bancosCAE = {};
    if (data.results?.[0]?.result?.data?.dsr?.DS?.[0]?.PH?.[0]?.DM0?.[0]?.S) {
      const raw = data.results[0].result.data.dsr.DS[0].PH[0].DM0[0].S;
      // raw es un array de objetos con Name y Value
      raw.forEach(item => {
        const bankName = item.N; // o el campo correcto que identifique el banco
        const cae = parseFloat(item.V); // o el campo correcto para CAE
        bancosCAE[bankName] = cae;
      });
    }

    res.json({ success: true, bancos: bancosCAE });
  } catch (err) {
    console.error('Error scraping CAE:', err.message);
    res.json({ success: false, message: 'Error scraping CAE', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Scraper SERNAC corriendo en puerto ${PORT}`);
});