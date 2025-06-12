const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const os = require('os');
const fsSync = require('fs');

const UPLOAD_DIR = path.join(process.cwd(), '../frontend/public/uploads/articles');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_WIDTH = 1920;
const QUALITY = 80;

const ensureUploadDir = async () => {
  try {
    console.log('Checking upload directory:', UPLOAD_DIR);
    await fs.access(UPLOAD_DIR);
  } catch {
    console.log('Creating upload directory:', UPLOAD_DIR);
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

const generateFilename = (originalname) => {
  const ext = path.extname(originalname);
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
};

const validateImage = (file) => {
  console.log('Validating image file:', file ? 
    {
      type: typeof file, 
      mimetype: file.mimetype || file.type,
      size: file.size,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path,
      hasHapi: !!file.hapi,
      originalFilename: file.originalFilename || file.name
    } : 'null');
    
  if (!file) {
    throw new Error('No file uploaded');
  }

  if (file.hapi && file.hapi.filename) {
    if (!ALLOWED_TYPES.includes(file.hapi.headers['content-type'])) {
      throw new Error(`Invalid file type: ${file.hapi.headers['content-type']}. Only PNG, JPG, and GIF are allowed`);
    }
    
    const fileSize = file.hapi.bytes || 0;
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${fileSize} bytes. Maximum size is 10MB`);
    }
    
    return;
  }
  
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Only PNG, JPG, and GIF are allowed`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes. Maximum size is 10MB`);
  }
};

const storeArticleImage = async (file) => {
  try {
    console.log('storeArticleImage called with:', typeof file, file ? Object.keys(file) : 'null');
    
    if (typeof file === 'string') {
      console.log('Handling file as string URL:', file);
      const filename = file.split('/').pop();
      return {
        filename,
        originalname: filename,
        mimetype: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 
                 filename.endsWith('.png') ? 'image/png' : 'image/gif',
        size: 0
      };
    }

    validateImage(file);
    await ensureUploadDir();

    let originalFilename = 'image.jpg';
    if (file.hapi && file.hapi.filename) {
      originalFilename = file.hapi.filename;
    } else if (file.originalname) {
      originalFilename = file.originalname;
    }
    
    const filename = generateFilename(originalFilename);
    const filepath = path.join(UPLOAD_DIR, filename);

    console.log('Processing image and saving to:', filepath);
    if (file.buffer) {
      console.log('Processing file from buffer, size:', file.buffer.length);
      try {
        await sharp(file.buffer)
          .resize(MAX_WIDTH, null, { 
            withoutEnlargement: true,
            fit: 'inside' 
          })
          .jpeg({ quality: QUALITY })
          .toFile(filepath);
        console.log('Successfully processed and saved buffer to file');
      } catch (sharpError) {
        console.error('Sharp processing error for buffer:', sharpError);
        await fs.writeFile(filepath, file.buffer);
        console.log('Fallback: Directly saved buffer to file');
      }
    } else if (file.path) {
      console.log('Processing file from path:', file.path);
      await sharp(file.path)
        .resize(MAX_WIDTH, null, { 
          withoutEnlargement: true,
          fit: 'inside' 
        })
        .jpeg({ quality: QUALITY })
        .toFile(filepath);
    } else if (file.hapi) {
      console.log('Processing file from Hapi with keys:', Object.keys(file));
      
      let buffer = null;
      
      if (file._data) {
        console.log('Using _data property');
        buffer = file._data;
      } else if (file.bytes) {
        console.log('Using bytes property');
        buffer = file.bytes;
      } else if (file._bytes) {
        console.log('Using _bytes property');
        buffer = file._bytes;
      } else if (file.hapi && file.hapi.filename) {
        console.log('Trying to get data from hapi property');
        if (file._tap && file._tap.payload) {
          buffer = file._tap.payload;
        } else {
          console.log('Hapi file structure found but no data. Available properties:', 
            Object.keys(file.hapi));
          if (file.hapi.filename) {
            const tempPath = path.join(os.tmpdir(), file.hapi.filename);
            if (fsSync.existsSync(tempPath)) {
              buffer = await fs.readFile(tempPath);
              console.log('Read data from temp file');
            }
          }
        }
      }
      
      if (!buffer) {
        console.error('Could not extract file data from Hapi request', file);
        throw new Error('Could not extract file data from Hapi request');
      }
      
      try {
        console.log('Processing with sharp, buffer size:', buffer.length);
        await sharp(buffer)
          .resize(MAX_WIDTH, null, { 
            withoutEnlargement: true,
            fit: 'inside' 
          })
          .jpeg({ quality: QUALITY })
          .toFile(filepath);
        console.log('Successfully processed and saved Hapi file');
      } catch (sharpError) {
        console.error('Sharp processing error for Hapi file:', sharpError);
        await fs.writeFile(filepath, buffer);
        console.log('Fallback: Directly saved Hapi file data to file');
      }
    } else {
      console.error('Unsupported file format received in storeArticleImage. File object:', file);
      if (file && typeof file === 'object') {
        console.error('File object keys:', Object.keys(file));
      }
      throw new Error('Unsupported file format: The uploaded file does not match any known structure (buffer, path, hapi). Please check the upload handler and client.');
    }

    if (file.filepath && !file.buffer && !file.path && !file.hapi) {
      try {
        const buffer = await fs.readFile(file.filepath);
        file = {
          buffer,
          mimetype: file.mimetype || file.type || 'image/jpeg',
          originalname: file.originalFilename || file.name || 'image.jpg',
          size: file.size || buffer.length
        };
        validateImage(file);
        let originalFilename = file.originalname;
        const filename = generateFilename(originalFilename);
        const filepath = path.join(UPLOAD_DIR, filename);
        console.log('Processing formidable file as buffer, size:', buffer.length);
        try {
          await sharp(buffer)
            .resize(MAX_WIDTH, null, { 
              withoutEnlargement: true,
              fit: 'inside' 
            })
            .jpeg({ quality: QUALITY })
            .toFile(filepath);
          console.log('Successfully processed and saved formidable buffer to file');
        } catch (sharpError) {
          console.error('Sharp processing error for formidable buffer:', sharpError);
          await fs.writeFile(filepath, buffer);
          console.log('Fallback: Directly saved formidable buffer to file');
        }
        return {
          filename,
          originalname: originalFilename,
          size: file.size,
          mimetype: file.mimetype
        };
      } catch (err) {
        console.error('Error handling formidable filepath fallback:', err);
        throw new Error('Failed to process uploaded image file');
      }
    }

    let fileSize = 0;
    let fileMimetype = 'image/jpeg';
    
    if (file.hapi) {
      fileSize = file.hapi.bytes || 0;
      fileMimetype = file.hapi.headers['content-type'] || 'image/jpeg';
    } else {
      fileSize = file.size || 0;
      fileMimetype = file.mimetype || 'image/jpeg';
    }

    return {
      filename,
      originalname: originalFilename,
      size: fileSize,
      mimetype: fileMimetype
    };
  } catch (error) {
    console.error('Error storing article image:', error);
    throw error;
  }
};

const deleteArticleImage = async (filename) => {
  if (!filename) return;
  
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  storeArticleImage,
  deleteArticleImage,
  ALLOWED_TYPES,
  MAX_FILE_SIZE
};
