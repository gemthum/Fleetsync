require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const DWH = require('./datafetch/units');
const zeus = require('./datafetch/zeus');
const encontrak = require('./datafetch/encontrak');


const app = express();
/*app.use(cors({
  origin: 'http://ssusa.zapto.org:3000', // Allow requests from your Vue app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authentication headers
})); */
app.use(cors());
const PORT = process.env.PORT || 3001;

async function processData() {
  try {
    const units = await DWH.fetchDWHdata('select U.* from SSUSA_UNIDADES_ACTIVAS U LEFT JOIN CONFIGURACION_UNIDADES C ON U.TIPO = C.TIPO WHERE UNIDAD NOT LIKE "%H%" AND C.REQUIERE_MUESTREO_FLEETSYNC = 1 order by UNIDAD;');

    const clients = await DWH.fetchDWHdata('select CLIENTE_ID, NOMBRE from clientes');

    const tasks = await zeus.fetchZeusData();

    const gpsData = await encontrak.fetchGPSData();


    const processedData = units.map((unit) => {
      const task = tasks.find((t) => t.UNIDAD === unit.UNIDAD && t.TAREA_CONCLUIDA === null);
      const gps = gpsData.find((g) => g.noEconomico === unit.UNIDAD);
    
      let timeDifferenceHours = null;
      let clienteName = 'Cliente no encontrado';
      let asunto = 'Sin asunto';
      let etapa = 'Sin etapa';
      let contacto = 'Sin contacto';
      let responsable = 'Sin responsable';
      let tipo = 'No encontrado';
      let fechavencimiento = 'Sin fecha';
      let base = 'Sin base';
      let timeDifference;
      let fechainicio = 'Sin fecha inicio';
      tipo = unit.TIPO;
      base = unit.BASE;
    
      if (task) {
        const client = clients.find((c) => c.CLIENTE_ID === task.CLIENTE);
        if (client) {
          clienteName = client.NOMBRE;
          asunto = task.ASUNTO;
          etapa = task.ETAPA;
          contacto = task.CONTACTO;
          responsable = task.RESPONSABLE;
          fechavencimiento = task.FECHA_HORA_VENCIMIENTO;
          fechainicio = task.FECHA_HORA_INICIO;
        }   
    
        // Calculate time difference if FECHA_INICIO and HORA_INICIO are available
        if (task.FECHA_INICIO && task.HORA_INICIO) {
          const startDate = new Date(task.FECHA_INICIO);
          // const startTime = new Date(task.HORA_INICIO);
          const hours = task.HORA_INICIO.getHours();
          const minutes = task.HORA_INICIO.getMinutes();
          startDate.setHours(hours, minutes, 0, 0);
          const now = new Date();
          const timeDifferenceMs = now - startDate;

          timeDifferenceHours = (timeDifferenceMs / (1000 * 60 * 60)).toFixed(2);
    
          const totalhours = Math.floor(timeDifferenceMs / (1000 * 60 * 60)); // Total hours
          const totalminutes = Math.floor((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60)); // Total minutes
    
          timeDifference = `${totalhours} Horas ${totalminutes} minutos`;
        }
      }
    
      return {
        UNIDAD: unit.UNIDAD,
        ESTATUS: task ? 'Ocupada' : 'Disponible',
        LOCALIZACION: gps ? gps.estadoGeoreferencia + ', ' + gps.municipioGeoreferencia + ', ' + gps.asentamientoGeoreferencia : 'Ubicacion no disponible',
        OT: task ? task.FOLIO : 'SIN FOLIO',
        HORAS: timeDifferenceHours !== null ? timeDifference : 'N/A',
        CLIENTE: clienteName, // Add the client's name here
        ASUNTO : asunto,
        ETAPA: etapa,
        TIPO: tipo,
        BASE: base,
        CONTACTO : contacto,
        RESPONSABLE : responsable,
        FECHA_VENCIMIENTO : fechavencimiento,
        FECHA_INICIO : fechainicio,
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