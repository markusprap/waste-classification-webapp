/**
 * Upload image to server and get the URL
 */
export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error uploading image');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
