export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.BUNNY_STORAGE_API_KEY;
    const storageZone = process.env.BUNNY_STORAGE_ZONE || 'onlymatt-public';
    const folder = process.env.BUNNY_SUBSCRIPTION_FOLDER || '';

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Bunny Storage API key not configured' 
      });
    }

    // Liste les fichiers du folder Bunny Storage
    const url = folder 
      ? `https://ny.storage.bunnycdn.com/${storageZone}/${folder}/`
      : `https://ny.storage.bunnycdn.com/${storageZone}/`;

    const response = await fetch(url, {
      headers: {
        AccessKey: apiKey,
      },
    });

    if (!response.ok) {
      console.error('Bunny Storage API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch images from Bunny Storage' 
      });
    }

    const files = await response.json();
    
    // Filtre uniquement les images subscription*.png
    const subscriptionImages = files.filter(
      (file) =>
        !file.IsDirectory &&
        file.ObjectName.toLowerCase().startsWith('subscription') &&
        file.ObjectName.toLowerCase().endsWith('.png')
    );

    if (subscriptionImages.length === 0) {
      return res.status(404).json({ 
        error: 'No subscription images found' 
      });
    }

    // Sélectionne une image aléatoire
    const randomImage = subscriptionImages[Math.floor(Math.random() * subscriptionImages.length)];
    
    // Construit l'URL CDN avec cache buster
    const cacheBuster = Date.now();
    const cdnPath = folder ? `${folder}/${randomImage.ObjectName}` : randomImage.ObjectName;
    const cdnUrl = `https://onlymatt-public-zone.b-cdn.net/${cdnPath}?v=${cacheBuster}`;

    return res.status(200).json({
      url: cdnUrl,
      filename: randomImage.ObjectName,
      totalImages: subscriptionImages.length,
    });
  } catch (error) {
    console.error('Random subscription API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
