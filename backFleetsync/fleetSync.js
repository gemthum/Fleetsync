require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Middleware de terceros
const axios = require('axios'); // Aunque no se usa directamente aquí, es buena práctica mantenerlo si otras partes del proyecto lo usan.

// Rutas
const authRoutes = require('./routes/authRoutes');

// Fuentes de datos
const DWH = require('./datafetch/units');
const zeus = require('./datafetch/zeus');
const encontrak = require('./datafetch/encontrak');

const app = express();
app.use(cors({
  origin: 'http://ssusa.zapto.org:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos en milisegundos

let cachedData = null;
let lastRefreshTime = null;

/**
 * Función para procesar y consolidar todos los datos.
 * Utiliza Promise.allSettled para manejar errores de forma asíncrona.
 */
async function processData() {
  try {
    console.log('Iniciando el procesamiento de datos...');

    const queries = [
      DWH.fetchDWHdata('select U.* from SSUSA_UNIDADES_ACTIVAS U LEFT JOIN CONFIGURACION_UNIDADES C ON U.TIPO = C.TIPO WHERE UNIDAD NOT LIKE "%H%" AND C.REQUIERE_MUESTREO_FLEETSYNC = 1 order by UNIDAD;'),
      DWH.fetchDWHdata('select CLIENTE_ID, NOMBRE from clientes'),
      zeus.fetchZeusData(),
      encontrak.fetchGPSData(),
    ];

    const [unitsResult, clientsResult, tasksResult, gpsDataResult] = await Promise.allSettled(queries);

    // Verificamos si alguna consulta falló y la manejamos
    const units = unitsResult.status === 'fulfilled' ? unitsResult.value : [];
    const clients = clientsResult.status === 'fulfilled' ? clientsResult.value : [];
    const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : [];
    const gpsData = gpsDataResult.status === 'fulfilled' ? gpsDataResult.value : [];

    // Log de errores para cada consulta fallida
    if (unitsResult.status === 'rejected') console.error('Error al obtener datos de DWH (unidades):', unitsResult.reason);
    if (clientsResult.status === 'rejected') console.error('Error al obtener datos de DWH (clientes):', clientsResult.reason);
    if (tasksResult.status === 'rejected') console.error('Error al obtener datos de Zeus:', tasksResult.reason);
    if (gpsDataResult.status === 'rejected') console.error('Error al obtener datos de Encontrak:', gpsDataResult.reason);

    // Si la consulta de unidades falla, no tiene sentido continuar
    if (units.length === 0) {
      console.warn('No se encontraron unidades. Devolviendo un array vacío.');
      return [];
    }

    const processedData = units.map(unit => {
      const task = tasks.find(t => t.UNIDAD === unit.UNIDAD && t.TAREA_CONCLUIDA === null);
      const gps = gpsData.find(g => g.noEconomico === unit.UNIDAD);

      // Usamos desestructuración y valores por defecto para un código más limpio
      const { ASUNTO, ETAPA, CONTACTO, RESPONSABLE, FECHA_HORA_VENCIMIENTO, FECHA_HORA_INICIO, FOLIO, CLIENTE, FECHA_INICIO, HORA_INICIO } = task || {};

      const client = CLIENTE ? clients.find(c => c.CLIENTE_ID === CLIENTE) : null;
      const clienteName = client ? client.NOMBRE : 'Cliente no encontrado';

      let timeDifference = 'N/A';
      if (FECHA_INICIO && HORA_INICIO) {
        // Validación y manejo de fechas
        try {
          const startDate = new Date(`${FECHA_INICIO}T${HORA_INICIO}`); // Formato ISO 8601
          const now = new Date();
          const timeDifferenceMs = now - startDate;
          const totalhours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
          const totalminutes = Math.floor((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60));
          timeDifference = `${totalhours} Horas ${totalminutes} minutos`;
        } catch (e) {
          console.error(`Error al procesar la fecha para la unidad ${unit.UNIDAD}:`, e.message);
        }
      }

      return {
        UNIDAD: unit.UNIDAD,
        ESTATUS: task ? 'Ocupada' : 'Disponible',
        LOCALIZACION: gps ? `${gps.estadoGeoreferencia}, ${gps.municipioGeoreferencia}, ${gps.asentamientoGeoreferencia}` : 'Ubicacion no disponible',
        OT: FOLIO || 'SIN FOLIO',
        HORAS: timeDifference,
        CLIENTE: clienteName,
        ASUNTO: ASUNTO || 'Sin asunto',
        ETAPA: ETAPA || 'Sin etapa',
        TIPO: unit.TIPO || 'No encontrado',
        BASE: unit.BASE || 'Sin base',
        CONTACTO: CONTACTO || 'Sin contacto',
        RESPONSABLE: RESPONSABLE || 'Sin responsable',
        FECHA_VENCIMIENTO: FECHA_HORA_VENCIMIENTO || 'Sin fecha',
        FECHA_INICIO: FECHA_HORA_INICIO || 'Sin fecha inicio',
      };
    });

    console.log('Procesamiento de datos finalizado.');
    return processedData;
  } catch (error) {
    // Este catch es el último recurso. `Promise.allSettled` ya manejó los errores.
    console.error('Error general en processData:', error);
    // Para no detener la aplicación, se devuelve un array vacío en caso de error crítico.
    return [];
  }
}

/**
 * Función para refrescar el caché de datos.
 */
async function refreshData() {
  console.log('Iniciando ciclo de refresco de datos.');
  try {
    const newData = await processData();
    if (newData.length > 0) {
      cachedData = newData;
      lastRefreshTime = new Date();
      console.log('Datos actualizados correctamente. Última actualización:', lastRefreshTime);
    } else {
      console.warn('El proceso de datos no retornó información. El caché no se actualizó.');
    }
  } catch (error) {
    // Si refreshData falla, el caché no se actualiza, pero la app sigue funcionando.
    console.error('Error fatal durante el refresh de datos:', error.message);
  }
}

// Inicialización de la caché y el intervalo
refreshData();
setInterval(refreshData, REFRESH_INTERVAL);

app.get('/availability', (req, res) => {
  console.log('Accediendo al endpoint /availability');
  if (!cachedData || !lastRefreshTime) {
    // Devuelve un error 503 si los datos no están listos
    console.warn('Datos no disponibles. Endpoint /availability');
    return res.status(503).json({
      error: 'Los datos no están disponibles. El servidor está procesando la información. Por favor, intente de nuevo más tarde.',
      status: 'unavailable'
    });
  }
  // Si los datos están, los envía.
  res.json({ data: cachedData, lastUpdated: lastRefreshTime.toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
