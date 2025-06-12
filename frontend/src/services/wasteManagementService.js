export const MAIN_CATEGORY_METHODS = {
  'Daur Ulang': 'recycle',
  'Organik': 'compost',
  'Anorganik': 'reduce',
  'B3': 'special',
  'Tekstil': 'reuse',
  'Lainnya': 'check',
  
  'Recyclable Waste': 'recycle',
  'Organic Waste': 'compost',
  'Inorganic Waste': 'reduce',
  'Hazardous Waste': 'special',
  'Reusable Waste': 'reuse',
  'Mixed/Other': 'check'
};

export const SUB_CATEGORY_METHODS = {
  'cardboard': 'recycle',
  'glass': 'recycle',
  'metal': 'recycle',
  'paper': 'recycle',
  'plastic': 'recycle',
  'brown-glass': 'recycle',
  'green-glass': 'recycle',
  'white-glass': 'recycle',
  
  'biological': 'compost',
  'organic': 'compost',
  
  'clothes': 'reuse',
  'shoes': 'reuse',
  
  'battery': 'special',
  
  'trash': 'reduce',
  
  'other': 'check'
};

export const WASTE_MANAGEMENT_DETAILS = {
  'recycle': {
    icon: 'recycle',
    color: 'blue',
    title: {
      en: 'Recycle',
      id: 'Daur Ulang'
    },
    description: {
      en: 'This item can be recycled into new products. Clean it and place it in a recycling bin or take it to a waste bank.',
      id: 'Item ini dapat didaur ulang menjadi produk baru. Bersihkan dan taruh di tempat sampah daur ulang atau bawa ke bank sampah.'
    },
    steps: {
      en: [
        'Clean the item from food residue or contaminants',
        'Separate it from other types of waste',
        'Place it in a recycling bin or designated container',
        'Consider taking it to a waste bank for proper recycling'
      ],
      id: [
        'Bersihkan item dari sisa makanan atau kontaminan',
        'Pisahkan dari jenis sampah lainnya',
        'Letakkan di tempat sampah daur ulang atau wadah khusus',
        'Pertimbangkan untuk membawanya ke bank sampah untuk didaur ulang dengan tepat'
      ]
    }
  },
  'compost': {
    icon: 'leaf',
    color: 'green',
    title: {
      en: 'Compost',
      id: 'Kompos'
    },
    description: {
      en: 'This organic waste can be composted to create nutrient-rich soil. Place it in an organic waste bin or compost it at home.',
      id: 'Sampah organik ini dapat dikomposkan untuk menciptakan tanah yang kaya nutrisi. Letakkan di tempat sampah organik atau komposkan di rumah.'
    },
    steps: {
      en: [
        'Separate from non-organic waste',
        'Cut into smaller pieces if possible',
        'Place in a composting bin or pile',
        'Mix with dry materials like leaves or paper',
        'Turn regularly to accelerate decomposition'
      ],
      id: [
        'Pisahkan dari sampah non-organik',
        'Potong menjadi potongan kecil jika memungkinkan',
        'Letakkan di tempat pengomposan',
        'Campur dengan material kering seperti daun atau kertas',
        'Aduk secara teratur untuk mempercepat penguraian'
      ]
    }
  },
  'reduce': {
    icon: 'trash',
    color: 'gray',
    title: {
      en: 'Reduce',
      id: 'Kurangi'
    },
    description: {
      en: 'This non-recyclable waste should be minimized. Consider alternatives that produce less waste in the future.',
      id: 'Sampah non-daur ulang ini sebaiknya diminimalkan. Pertimbangkan alternatif yang menghasilkan lebih sedikit sampah di masa depan.'
    },
    steps: {
      en: [
        'Dispose of in the general waste bin',
        'Consider alternatives that create less waste next time',
        'Look for recyclable or reusable alternatives',
        'Minimize usage of similar items in the future'
      ],
      id: [
        'Buang ke tempat sampah umum',
        'Pertimbangkan alternatif yang menciptakan lebih sedikit sampah lain waktu',
        'Cari alternatif yang dapat didaur ulang atau digunakan kembali',
        'Minimalkan penggunaan barang serupa di masa depan'
      ]
    }
  },
  'reuse': {
    icon: 'repeat',
    color: 'purple',
    title: {
      en: 'Reuse',
      id: 'Gunakan Kembali'
    },
    description: {
      en: 'This item can be reused or donated instead of thrown away. Consider giving it a second life.',
      id: 'Item ini dapat digunakan kembali atau disumbangkan daripada dibuang. Pertimbangkan untuk memberinya kesempatan kedua.'
    },
    steps: {
      en: [
        'Clean the item if necessary',
        'Donate to charity or thrift stores if in good condition',
        'Repurpose for a different use at home',
        'Sell or give away through online marketplaces or community groups',
        'Repair if broken instead of replacing'
      ],
      id: [
        'Bersihkan barang jika perlu',
        'Donasikan ke badan amal atau toko barang bekas jika dalam kondisi baik',
        'Alihkan fungsi untuk penggunaan berbeda di rumah',
        'Jual atau berikan melalui pasar online atau kelompok komunitas',
        'Perbaiki jika rusak daripada menggantinya'
      ]
    }
  },
  'special': {
    icon: 'alert-triangle',
    color: 'red',
    title: {
      en: 'Special Disposal',
      id: 'Pembuangan Khusus'
    },
    description: {
      en: 'This hazardous waste requires special handling. Take it to designated collection points for safe disposal.',
      id: 'Sampah berbahaya ini memerlukan penanganan khusus. Bawa ke titik pengumpulan yang ditentukan untuk pembuangan yang aman.'
    },
    steps: {
      en: [
        'Never mix with regular household waste',
        'Store safely until disposal',
        'Take to a designated hazardous waste collection point',
        'Contact local authorities for proper disposal guidelines',
        'Never dump in regular trash or down drains'
      ],
      id: [
        'Jangan pernah mencampur dengan sampah rumah tangga biasa',
        'Simpan dengan aman sampai pembuangan',
        'Bawa ke tempat pengumpulan limbah berbahaya yang ditentukan',
        'Hubungi pihak berwenang setempat untuk panduan pembuangan yang tepat',
        'Jangan pernah membuang di tempat sampah biasa atau saluran pembuangan'
      ]
    }
  },
  'check': {
    icon: 'help-circle',
    color: 'yellow',
    title: {
      en: 'Check Manual',
      id: 'Periksa Manual'
    },
    description: {
      en: 'This item needs manual checking to determine the best disposal method. Check local guidelines or consult waste management experts.',
      id: 'Item ini perlu diperiksa secara manual untuk menentukan metode pembuangan terbaik. Periksa pedoman lokal atau konsultasikan dengan ahli pengelolaan sampah.'
    },
    steps: {
      en: [
        'Examine the item for recycling symbols or material information',
        'Check local waste management guidelines',
        'Separate components if made of different materials',
        'Contact local waste management for specific guidance',
        'Consider if parts can be recycled, composted, or reused'
      ],
      id: [
        'Periksa item untuk simbol daur ulang atau informasi material',
        'Periksa pedoman pengelolaan sampah lokal',
        'Pisahkan komponen jika terbuat dari bahan yang berbeda',
        'Hubungi pengelolaan sampah lokal untuk panduan khusus',
        'Pertimbangkan apakah bagian-bagiannya dapat didaur ulang, dikomposkan, atau digunakan kembali'
      ]
    }
  }
};

export function getWasteManagementMethod(classificationResult) {
  if (!classificationResult) return 'check';
  
  const mainCategory = classificationResult.mainCategory;
  if (mainCategory && MAIN_CATEGORY_METHODS[mainCategory]) {
    return MAIN_CATEGORY_METHODS[mainCategory];
  }
  
  const subcategory = classificationResult.type?.toLowerCase();
  if (subcategory && SUB_CATEGORY_METHODS[subcategory]) {
    return SUB_CATEGORY_METHODS[subcategory];
  }
  
  return 'check';
}

export function getWasteManagementDetails(method, language = 'en') {
  const details = WASTE_MANAGEMENT_DETAILS[method] || WASTE_MANAGEMENT_DETAILS['check'];
  
  return {
    icon: details.icon,
    color: details.color,
    title: details.title[language] || details.title.en,
    description: details.description[language] || details.description.en,
    steps: details.steps[language] || details.steps.en
  };
}

export function getWasteManagementGuidance(classificationResult, language = 'en') {
  const method = getWasteManagementMethod(classificationResult);
  const details = getWasteManagementDetails(method, language);
  
  return {
    method,
    ...details,
    category: classificationResult?.mainCategory || 'Unknown',
    subcategory: classificationResult?.type || 'Unknown',
    confidence: classificationResult?.confidence || 0
  };
}
