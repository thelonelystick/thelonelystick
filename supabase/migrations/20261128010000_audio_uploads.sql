update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/webm',
      'audio/mp4',
      'audio/x-m4a',
      'audio/aac'
    ]
where id = 'portfolio-media';
