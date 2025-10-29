const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    // Reemplaza con tu URL base real
    BASE_URL: 'https://accounts.haulmer.com',
    // Reemplaza con tu token de autorización real
    AUTH_TOKEN: '-',
    // Archivo con los IDs de usuarios
    USERS_FILE: 'users.txt',
    // Delay entre llamadas en milisegundos
    DELAY_MS: 3000,
    // Archivo de log
    LOG_FILE: 'process-log.txt'
};

/**
 * Función para hacer delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Función para escribir logs
 */
function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage);
}

/**
 * Función para hacer la petición a la API
 */
async function executeUserAction(userId) {
    const url = `${CONFIG.BASE_URL}/admin/realms/haulmer-users/users/${userId}/execute-actions-email`;
    
    try {
        writeLog(`Iniciando petición para usuario: ${userId}`);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.AUTH_TOKEN}`
            },
            body: JSON.stringify(['UPDATE_PASSWORD'])
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        writeLog(`✅ Usuario ${userId}: Éxito - ${response.status} ${response.statusText}`);
        return {
            success: true,
            userId,
            status: response.status,
            response: responseText
        };

    } catch (error) {
        writeLog(`❌ Usuario ${userId}: Error - ${error.message}`);
        throw error;
    }
}

/**
 * Función principal
 */
async function processUsers() {
    try {
        writeLog('=== INICIANDO PROCESAMIENTO DE USUARIOS ===');
        
        // Verificar que existe el archivo de usuarios
        if (!fs.existsSync(CONFIG.USERS_FILE)) {
            throw new Error(`El archivo ${CONFIG.USERS_FILE} no existe`);
        }

        // Leer IDs de usuarios y filtrar duplicados usando Set
        const usersContent = fs.readFileSync(CONFIG.USERS_FILE, 'utf8');
        const allUserIds = usersContent
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (allUserIds.length === 0) {
            throw new Error('No se encontraron IDs de usuarios en el archivo');
        }

        // Usar Set para eliminar duplicados y convertir de vuelta a array
        const userIds = [...new Set(allUserIds)];
        const duplicatesRemoved = allUserIds.length - userIds.length;

        writeLog(`Se encontraron ${allUserIds.length} IDs en el archivo`);
        if (duplicatesRemoved > 0) {
            writeLog(`Se eliminaron ${duplicatesRemoved} IDs duplicados`);
        }
        writeLog(`Se procesarán ${userIds.length} usuarios únicos`);

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Procesar cada usuario
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            
            try {
                const result = await executeUserAction(userId);
                results.push(result);
                successCount++;
                
                writeLog(`Progreso: ${i + 1}/${userIds.length} usuarios procesados`);
                
                // Delay entre llamadas (excepto en la última)
                if (i < userIds.length - 1) {
                    writeLog(`Esperando ${CONFIG.DELAY_MS / 1000} segundos antes de la siguiente llamada...`);
                    await delay(CONFIG.DELAY_MS);
                }
                
            } catch (error) {
                errorCount++;
                writeLog(`❌ ERROR CRÍTICO: ${error.message}`);
                writeLog('🛑 DETENIENDO PROCESAMIENTO debido a error');
                break;
            }
        }

        // Resumen final
        writeLog('=== RESUMEN FINAL ===');
        writeLog(`Total procesados: ${results.length}`);
        writeLog(`Éxitos: ${successCount}`);
        writeLog(`Errores: ${errorCount}`);
        
        if (errorCount > 0) {
            writeLog('⚠️  El procesamiento se detuvo debido a errores');
            process.exit(1);
        } else {
            writeLog('✅ Procesamiento completado exitosamente');
        }

    } catch (error) {
        writeLog(`❌ ERROR FATAL: ${error.message}`);
        process.exit(1);
    }
}

// Verificar que fetch esté disponible (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ Este script requiere Node.js 18+ o instalar node-fetch');
    console.error('Instala node-fetch con: npm install node-fetch');
    process.exit(1);
}

// Ejecutar el script
if (require.main === module) {
    processUsers();
}

module.exports = { processUsers, executeUserAction };
