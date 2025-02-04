require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const DWH = require('./datafetch/units');
const zeus = require('./datafetch/zeus');
const encontrak = require('./datafetch/encontrak');


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

async function processData() {
  try {
    const units = await DWH.fetchDWHdata('select SU.*, C.VALOR_DESPLEGADO AS TIPO from SSUSA_UNIDADES_ACTIVAS SU left join activos_fijos A ON SU.ACTIVO_FIJO_ID = A.ACTIVO_FIJO_ID LEFT JOIN libres_act_fijos B ON A.ACTIVO_FIJO_ID = B.ACTIVO_FIJO_ID LEFT JOIN listas_atributos C ON B.TIPO = C.LISTA_ATRIB_ID WHERE SU.UNIDAD NOT LIKE "%H%" order by UNIDAD;');

    const clients = await DWH.fetchDWHdata('select CLIENTE_ID, NOMBRE from clientes');

    const tasks = await zeus.fetchZeusData();

    const gpsData = await encontrak.fetchGPSData();


    const processedData = units.map((unit) => {
      const task = tasks.find((t) => t.UNIDAD === unit.UNIDAD && t.FECHA_CONCLUIDA === null);
      const gps = gpsData.find((g) => g.noEconomico === unit.UNIDAD);
    
      let timeDifferenceHours = null;
      let clienteName = 'Cliente no encontrado';
      let asunto = 'Sin asunto';
      let etapa = 'Sin etapa';
      let tipo = 'No encontrado';
      let timeDifference;
      tipo = unit.TIPO;
    
      if (task) {
        const client = clients.find((c) => c.CLIENTE_ID === task.CLIENTE);
        if (client) {
          clienteName = client.NOMBRE;
          asunto = task.ASUNTO;
          etapa = task.ETAPA;
        }   
    
        // Calculate time difference if FECHA_INICIO and HORA_INICIO are available
        if (task.FECHA_INICIO && task.HORA_INICIO) {
          const startDate = new Date(task.FECHA_INICIO);
          const startTime = new Date(task.HORA_INICIO);
          startDate.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds());
    
          const now = new Date();
          const timeDifferenceMs = now - startDate;
          timeDifferenceHours = (timeDifferenceMs / (1000 * 60 * 60)).toFixed(2);
    
          const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60)); // Total hours
          const minutes = Math.floor((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60)); // Total minutes
    
          timeDifference = `${hours} Horas ${minutes} minutos`;
        }
      }
    
      return {
        UNIDAD: unit.UNIDAD,
        ESTATUS: task ? 'Ocupada' : 'Disponible',
        LOCALIZACION: gps ? gps.asentamientoGeoreferencia : 'Ubicacion no disponible',
        OT: task ? task.FOLIO : 'SIN FOLIO',
        HORAS: timeDifferenceHours !== null ? timeDifference : 'N/A',
        CLIENTE: clienteName, // Add the client's name here
        ASUNTO : asunto,
        ETAPA: etapa,
        TIPO: tipo,
      };
    });

    return processedData;
  } catch (error) {
    console.error('Error en processData:', error.message);
    throw error;
  }
}

async function refreshData() {
  try {
    console.log('Solicitud de datos');
    cachedData = await processData();
    lastRefreshTime = new Date();
    console.log('Ultima actualizacion ', lastRefreshTime);
  } catch (error) {
    console.error('Error en la funcion refreshData:', error.message);
  }
}

refreshData();
setInterval(refreshData, 15 * 60 * 1000);

app.get('/availability', async (req, res) => {
  console.log('accediendo a availability');
  if (!lastRefreshTime) {
    return res.status(503).json({ error: 'Los datos no estan disponibles, por favor intente de nuevo mas tarde.' });
  }
  res.json({ data: cachedData, lastUpdated: lastRefreshTime });
});

app.use(express.json()); // Middleware for parsing JSON bodies
app.use('/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});