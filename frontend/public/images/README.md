# 📁 Images Directory Structure

This directory contains all static images used in the WasteWise AI application, organized by type for better maintainability.

## 🗂️ Folder Structure

```
images/
├── icons/          # UI icons and small graphics
├── illustrations/  # Larger graphics and illustrations
├── logos/         # Brand logos and identity assets
├── placeholders/  # Default/fallback images
├── team/          # Team member photos
└── tech/          # Technology stack logos
```

## 📂 Folder Descriptions

### `icons/` - UI Icons and Small Graphics
- **Purpose**: Small icons used throughout the UI
- **Files**: 
  - `atom.png` - React icon
  - `education.png` - Education/learning icon
  - `globe.png` - Global/world icon
  - `leaf.png` - Eco-friendly/sustainability icon
  - `robot.png` - AI/automation icon

### `illustrations/` - Graphics and Illustrations
- **Purpose**: Larger visual elements and illustrations
- **Files**:
  - `recycling-illustration.jpeg` - Main hero section illustration

### `logos/` - Brand and Organization Logos
- **Purpose**: Brand identity and partner logos
- **Files**:
  - `recycle-logo.png` - Main app logo (dark version)
  - `recycle-logo-white.png` - Main app logo (light version)
  - `coding-camp-logo.png` - Coding Camp partner logo
  - `dicoding-logo.png` - Dicoding partner logo

### `placeholders/` - Default/Fallback Images
- **Purpose**: Default images when content is not available
- **Files**:
  - `placeholder.jpg` - Generic placeholder for articles, profiles, etc.

### `team/` - Team Member Photos
- **Purpose**: Team member profile photos and related images
- **Guidelines**:
  - Use consistent aspect ratio (1:1 recommended for profiles)
  - Optimize for web (compress images)
  - Use descriptive filenames (e.g., `john-doe.jpg`)

### `tech/` - Technology Stack Logos
- **Purpose**: Logos of technologies and frameworks used
- **Files**:
  - `python.png` - Python programming language
  - `nodejs.png` - Node.js runtime
  - `nextjs.png` - Next.js framework
  - `express.png` - Express.js framework

## 🔧 Usage Guidelines

### Importing Images in Components
```jsx
import Image from 'next/image'

// For icons
<Image src="/images/icons/leaf.png" alt="Eco-friendly" width={32} height={32} />

// For logos
<Image src="/images/logos/recycle-logo.png" alt="WasteWise AI" width={120} height={40} />

// For team photos
<Image src="/images/team/member-name.jpg" alt="Team Member" width={200} height={200} />
```

### Path Conventions
- Always use absolute paths starting with `/images/`
- Include descriptive alt text for accessibility
- Specify width and height for better performance
- Use appropriate folder based on image type

### Adding New Images
1. **Choose the correct folder** based on image type
2. **Use descriptive filenames** (lowercase, hyphenated)
3. **Optimize images** before adding (compress, resize appropriately)
4. **Update this README** if adding new categories
5. **Test image paths** in development before committing

### Image Optimization Tips
- **Format**: Use WebP when possible, fallback to PNG/JPG
- **Size**: Compress images to reduce file size
- **Dimensions**: Resize to actual display size
- **Alt text**: Always provide meaningful alt text for accessibility

## 🔄 Migration Notes

This structure was reorganized from a flat structure to improve maintainability. All existing image references have been updated to use the new paths.

### Recent Changes
- Moved logos to `logos/` folder
- Moved icons to `icons/` folder  
- Moved tech images to `tech/` folder
- Moved illustrations to `illustrations/` folder
- Moved placeholders to `placeholders/` folder
- Updated all import paths in components

## 📝 Best Practices

1. **Consistency**: Maintain consistent naming conventions
2. **Organization**: Keep images in appropriate folders
3. **Optimization**: Always optimize images for web
4. **Documentation**: Update this README when making changes
5. **Accessibility**: Provide meaningful alt text for all images
