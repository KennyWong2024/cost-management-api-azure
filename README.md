# Extracción del API de Azure Cost Management

Este proyecto proporciona un script en Node.js para extraer información de costos desde la API de Azure Cost Management, procesarla y guardarla en formato JSON, es con fines ilustrativos con el fin de comprender el cómo funciona el API sin embargo no se limite, el código es perfectamente compatible para entregar la data a una base analítica automatizada como lo puede ser BigQuery, Redshift entre otras, ademas su salida puede determinarse en el proceso de tranformación ya sea construirlo como un .json o incluso .csv si el destino no es compatible con el formato .json.

## Requisitos previos

Antes de ejecutar el script, asegúrase de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
- Una cuenta de Azure con los permisos adecuados para acceder a la API de costos

## Instalación

1. Clone el repositorio:

   ```sh
   git clone
   cd cost-management-api-azure
   ```

2. Instalar dependencias:

   ```sh
   npm install
   ```

## Configuración

Antes de ejecutar el script, configure las variables de entorno creando un archivo `.env` en la raíz del proyecto. Use el siguiente formato:

```
AZURE_TENANT_ID=tu_tenant_id
AZURE_CLIENT_ID=tu_client_id
AZURE_CLIENT_SECRET=tu_client_secret
AZURE_SUBSCRIPTION_ID=tu_subscription_id
```

## Uso para ejemplo

Ejecutar el script con el siguiente comando en el terminal:

```sh
node nombre_de_la_funcion.js
```

Esto realizará los siguientes pasos:

- Obtendrá un token de acceso de Azure.
- Extraerá los datos de costos de la API.
- Transformará los datos a un formato estructurado.
- Guardará los datos como un archivo JSON.

## Estructura del proyecto

```
cost-management-api-azure/
├── cost_management_extraction.js   # Script principal
├── .env.example                    # Ejemplo de configuración de variables
├── package.json                    # Dependencias
├── README.md                       # Documentación del proyecto
└── LICENSE                         # Licencia del proyecto
```

## Licencia

Este proyecto está bajo la licencia MIT.
