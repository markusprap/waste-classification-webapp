const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const os = require('os');
const fsSync = require('fs');

// Article image constants
const UPLOAD_DIR = path.join(process.cwd(), '../frontend/public/uploads/articles');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_WIDTH = 1920; // Max width for article cover images
const QUALITY = 80; // Image compression quality

/**
 * Ensures the upload directory exists
 */
const ensureUploadDir = async () => {
  try {
    console.log('Checking upload directory:', UPLOAD_DIR);
    await fs.access(UPLOAD_DIR);
  } catch {
    console.log('Creating upload directory:', UPLOAD_DIR);
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

/**
 * Generates a unique filename for uploaded images
 * @param {string} originalname - Original filename from upload
 * @returns {string} Generated unique filename
 */
const generateFilename = (originalname) => {
  const ext = path.extname(originalname);
  const hash = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
};

/**
 * Validates an image file
 * @param {object} file - File object from multer
 * @throws {Error} If validation fails
 */
const validateImage = (file) => {
  // Log file information for debugging
  console.log('Validating image file:', file ? 
    {
      type: typeof file, 
      mimetype: file.mimetype, 
      size: file.size,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path,
      hasHapi: !!file.hapi
    } : 'null');
    
  if (!file) {
    throw new Error('No file uploaded');
  }

  // Handle hapi file structure if present
  if (file.hapi && file.hapi.filename) {
    if (!ALLOWED_TYPES.includes(file.hapi.headers['content-type'])) {
      throw new Error(`Invalid file type: ${file.hapi.headers['content-type']}. Only PNG, JPG, and GIF are allowed`);
    }
    
    // Check file size if available
    const fileSize = file.hapi.bytes || 0;
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${fileSize} bytes. Maximum size is 10MB`);
    }
    
    return;
  }
  
  // Regular file check for mimetype
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Only PNG, JPG, and GIF are allowed`);
  }

  // Check file size if available
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes. Maximum size is 10MB`);
  }
};

/**
 * Process and store an uploaded article image
 * @param {object} file - File object from multer
 * @returns {object} Stored file metadata
 */
const storeArticleImage = async (file) => {
  try {
    console.log('storeArticleImage called with:', typeof file, file ? Object.keys(file) : 'null');
    
    // If file is a string (URL path), handle it differently
    if (typeof file === 'string') {
      console.log('Handling file as string URL:', file);
      const filename = file.split('/').pop();
      return {
        filename,
        originalname: filename,
        mimetype: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 
                 filename.endsWith('.png') ? 'image/png' : 'image/gif',
        size: 0 // Size unknown for URL strings
      };
    }

    // Validate the file
    validateImage(file);
    await ensureUploadDir();

    // Handle filename generation based on file structure
    let originalFilename = 'image.jpg';
    if (file.hapi && file.hapi.filename) {
      originalFilename = file.hapi.filename;
    } else if (file.originalname) {
      originalFilename = file.originalname;
    }
    
    const filename = generateFilename(originalFilename);
    const filepath = path.join(UPLOAD_DIR, filename);

    console.log('Processing image and saving to:', filepath);    // Handle different file structures from different sources
    if (file.buffer) {
      // Handle buffer from multer/formidable/etc
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
        // Fallback to direct file save if sharp fails
        await fs.writeFile(filepath, file.buffer);
        console.log('Fallback: Directly saved buffer to file');
      }
    } else if (file.path) {
      // Handle file with path (from disk)
      console.log('Processing file from path:', file.path);
      await sharp(file.path)
        .resize(MAX_WIDTH, null, { 
          withoutEnlargement: true,
          fit: 'inside' 
        })
        .jpeg({ quality: QUALITY })
        .toFile(filepath);    } else if (file.hapi) {
      // Handle Hapi file structure
      console.log('Processing file from Hapi with keys:', Object.keys(file));
      
      // Try different ways to get the buffer from Hapi file object
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
        // Try to get the raw data from the Hapi request
        console.log('Trying to get data from hapi property');
        if (file._tap && file._tap.payload) {
          buffer = file._tap.payload;
        } else {
          console.log('Hapi file structure found but no data. Available properties:', 
            Object.keys(file.hapi));
            // Last resort: try to read from the temp file if it exists
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
        // Fallback to direct file save if sharp fails
        await fs.writeFile(filepath, buffer);
        console.log('Fallback: Directly saved Hapi file data to file');
      }
    } else {
      throw new Error('Unsupported file format');
    }

    // Prepare and return the file metadata
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

/**
 * Delete a stored article image
 * @param {string} filename - Name of file to delete
 */
const deleteArticleImage = async (filename) => {
  if (!filename) return;
  
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw - file may already be deleted
  }
};

module.exports = {
  storeArticleImage,
  deleteArticleImage,
  ALLOWED_TYPES,
  MAX_FILE_SIZE
};
