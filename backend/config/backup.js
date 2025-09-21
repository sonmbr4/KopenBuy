 /* eslint-disable no-unused-vars 
 const {exec} = require('child_process');
 process.loadEnvFile('./.env'); 
  
 exports.backupDatabase = async () => {
     //const dbName = 'kopenBuy';
     const outputPath = './backup';
 
     const command = `mongodump --uri "${process.env.MONGO_URI}" --out ${outputPath} --gzip`;
 
     await exec(command, (error, stdout, stderr) => {
         if (error) {
             console.error(`Error en el respaldo: ${error.message}`);
             return;
         }
         console.log(`Respaldo completado con éxito ${stdout}`);
     });
 };
*/
