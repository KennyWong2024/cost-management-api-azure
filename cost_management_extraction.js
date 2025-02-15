// Este código proporciona una guía para extraer datos del API de Azure Cost Management.
// Las variables de entorno utilizadas en este script deben ser solicitadas al administrador de servicios en la nube.
// La información es actualizada y funcional para el año 2025, aunque podría estar sujeta a cambios en el futuro.

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// ---------------------- Variables de Entorno ----------------------
// Las variables de entorno almacenan información sensible, como credenciales.
// Por motivos de seguridad, nunca deben incluirse directamente en el código fuente.
// Se definen en un archivo .env, el cual no debe ser compartido en repositorios públicos.
// En este caso, las variables contienen las credenciales necesarias para autenticarse en el API de Azure.

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const subscriptionId = process.env.SUBSCRIPTION_ID;

// ---------------------- Función para Obtener el Rango de Fechas ----------------------
// Esta función calcula el rango de fechas para la extracción de datos del día anterior.
// Es utilizada en la solicitud al API para obtener la información correspondiente a ese período.
function getYesterdayRange() {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    return {
        from: yesterday.toISOString().split('T')[0],
        to: yesterday.toISOString().split('T')[0],
    };
}

// ---------------------- Autenticación: Obtener Token de Acceso ----------------------
// Para interactuar con el API de Azure, es necesario autenticarse mediante un token de acceso.
// En este caso, se emplea el flujo de autenticación `client_credentials`.
async function getAccessToken() {
    const response = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scope: 'https://management.azure.com/.default',
        })
    );
    return response.data.access_token;
}

// ---------------------- Extracción de Datos de Costos desde el API ----------------------
// Esta función realiza la solicitud al API de Azure para obtener los datos de costos.
// Corresponde a la fase de "Extracción" en un proceso ETL.
async function getCostData(accessToken) {
    const { from, to } = getYesterdayRange();
    const url = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;

    const response = await axios.post(
        url,
        {
            type: "Usage",
            timeframe: "Custom",
            timePeriod: { from, to },
            dataset: {
                granularity: "Daily",
                aggregation: {
                    totalCost: {
                        name: "PreTaxCost",
                        function: "Sum"
                    }
                },
                grouping: [
                    { type: "Dimension", name: "ResourceGroupName" },
                    { type: "Dimension", name: "ResourceId" },
                    { type: "Dimension", name: "SubscriptionName" },
                    { type: "Dimension", name: "MeterCategory" },
                    { type: "Dimension", name: "MeterSubcategory" },
                    { type: "Dimension", name: "Product" },
                    { type: "Dimension", name: "ServiceFamily" },
                    { type: "Dimension", name: "UnitOfMeasure" },
                    { type: "Dimension", name: "BillingAccountName" },
                    { type: "Dimension", name: "InvoiceSectionName" },
                    { type: "Dimension", name: "PricingModel" },
                    { type: "Dimension", name: "ResourceLocation" },
                    { type: "Dimension", name: "ChargeType" },
                    { type: "Dimension", name: "ServiceName" },
                    { type: "Dimension", name: "BillingMonth" }
                ],
                metrics: [
                    { name: "Quantity" },
                    { name: "CostInUSD" },
                    { name: "EffectivePrice" }
                ]
            }
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        }
    );
    return response.data;
}

// ---------------------- Carga de Datos (Guardar JSON) ----------------------
// Corresponde a la fase de "Carga" en un proceso ETL.
// Guarda los datos obtenidos en un archivo JSON local.
async function saveDataAsJSON(data) {
    fs.writeFileSync('reporte-de-costos.json', JSON.stringify(data, null, 2));
    console.log('El reporte ha sido guardado');
}

// ---------------------- Función Principal ----------------------
// Esta función coordina el proceso completo de ETL: autenticación, extracción y carga.
async function main() {
    try {
        // Autenticación: Obtención del token de acceso.
        console.log("Obteniendo token..."); 
        const accessToken = await getAccessToken(); 

        // Extracción: Solicitud de datos al API de Azure.
        console.log("Obteniendo datos..."); 
        const costData = await getCostData(accessToken);

        // Transformación: Estructuración de los datos antes de almacenarlos.
        const formattedData = costData.properties.rows.map(row => {
            const record = {};
            costData.properties.columns.forEach((col, index) => {
                record[col.name] = row[index];
            });
            return record;
        });

        // Carga: Guardado de los datos en un archivo JSON local.
        console.log("Guardando datos...");
        await saveDataAsJSON(formattedData);

        console.log("Proceso exitoso");
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

main();

// En este ejemplo, los datos se descargan y se almacenan en un archivo JSON.
// Sin embargo, este proceso puede automatizarse para cargar los datos en un servicio de almacenamiento en la nube.
// Posteriormente, estos datos pueden ser modelados y utilizados en herramientas de inteligencia de negocio (BI).
// Esto permitirá a la empresa contar con información de facturación actualizada,
// detectar patrones e inconsistencias y tomar decisiones estratégicas para mejorar sus procesos.
