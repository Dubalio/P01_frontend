import { Router } from 'express';
import { spawn } from 'child_process';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');


router.post('/process', authenticateToken, (req, res) => {

  const today = new Date().toISOString().split('T')[0];
  
  console.log(`Iniciando procesamiento para fecha: ${today}`);
  

  const pythonScript = path.join(rootDir, 'src', 'main.py');
  

  const pythonProcess = spawn('python', [pythonScript, today]);
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`Python stdout: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(`Python stderr: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error procesando documentos', 
        error: errorOutput 
      });
    }
    
    try {
      const result = JSON.parse(output);
      return res.json({ 
        success: true, 
        message: 'Procesamiento completado', 
        result 
      });
    } catch (e) {
      return res.json({ 
        success: true, 
        message: 'Procesamiento completado', 
        output 
      });
    }
  });
});

router.get('/', authenticateToken, async (req, res) => {
  try {
  
    const db = req.app.locals.db;
    const documents = await db.collection('documents').find({}).toArray();
    
    return res.json({ success: true, documents });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;