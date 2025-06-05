# Model Preprocessing Debug Guide

## Problem
Model yang akurat di Google Colab memberikan hasil yang tidak akurat saat diimplementasikan di frontend.

## Possible Causes
1. **Preprocessing Differences**: Metode preprocessing yang berbeda antara training dan inference
2. **Normalization**: Range nilai yang berbeda (0-1 vs -1-1 vs ImageNet normalization)
3. **Image Resizing**: Metode resizing yang berbeda (bilinear vs nearest neighbor)
4. **Data Type**: Float32 vs Float64 vs Int

## Testing Methods

### 1. Console Debugging
Buka Developer Tools di browser dan jalankan:

```javascript
// Test semua metode preprocessing pada gambar yang sama
window.debugPreprocessing(imageFile)

// Lihat metode preprocessing saat ini
import { PREPROCESSING_METHOD } from '/lib/tensorflow-model.js'
console.log('Current method:', PREPROCESSING_METHOD)
```

### 2. Available Preprocessing Methods

**Standard (Default)**
```javascript
// Range: [0, 1]
tensor = tensor.div(255.0)
```

**ImageNet Style**
```javascript
// Range: normalized dengan ImageNet mean/std
tensor = tensor.div(255.0)
tensor = tensor.sub([0.485, 0.456, 0.406]).div([0.229, 0.224, 0.225])
```

**Custom**
```javascript
// Range: [-1, 1]
tensor = tensor.div(127.5).sub(1.0)
```

### 3. How to Change Preprocessing Method

Edit `/lib/tensorflow-model.js` line 7:
```javascript
const PREPROCESSING_METHOD = 'standard' // Change to: 'imagenet' or 'custom'
```

### 4. Console Output Analysis

Perhatikan output console saat klasifikasi:
- **Raw model predictions**: Array probabilitas [class0, class1, class2]
- **Sample pixel values**: Untuk memverifikasi range normalization
- **Tensor shapes**: Memastikan dimensi input benar

### 5. Common Google Colab Preprocessing

Jika di Colab menggunakan:
- `tf.keras.preprocessing.image.load_img()` → biasanya [0, 1]
- `tf.keras.applications.imagenet_utils.preprocess_input()` → ImageNet normalization
- `cv2.imread()` + manual normalization → bisa [0, 1] atau [-1, 1]

### 6. Debugging Steps

1. **Upload test image** yang sama dengan yang digunakan di Colab
2. **Check console output** untuk raw predictions
3. **Compare results** dengan hasil Colab
4. **Switch preprocessing method** dan test lagi
5. **Pilih method** yang memberikan hasil paling mirip dengan Colab

### 7. Expected Console Output

```
🔧 Starting image preprocessing with method: standard
📐 Initial tensor shape: [height, width, 3]
📏 Resized tensor shape: [150, 150, 3]
🎨 Applied standard normalization: [0, 1]
📦 Final tensor shape with batch dimension: [1, 150, 150, 3]
🔍 Sample 3x3 pixel values (first channel):
🔍 Raw model predictions: [0.1234, 0.7891, 0.0875]
```

## Quick Fix Recommendations

1. **Try 'imagenet' method first** - paling umum untuk model CNN
2. **Check pixel value ranges** - pastikan tidak ada nilai NaN atau Infinity
3. **Compare raw predictions** - angka harus masuk akal (tidak ekstrem)
4. **Test dengan beberapa gambar** - pastikan konsisten

## Export for External Testing

Model ini juga mengexport `testPreprocessingMethods()` function yang bisa digunakan untuk testing otomatis semua metode.
