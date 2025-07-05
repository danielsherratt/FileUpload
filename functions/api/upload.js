export async function onRequestPost({ request, env }) {
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('multipart/form-data')) {
    return new Response('Expected multipart/form-data', { status: 400 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!file || !(file instanceof File)) {
    return new Response('No file uploaded', { status: 400 });
  }

  const key = `uploads/${Date.now()}-${file.name}`;
  await env.MY_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  });

  // If your bucket is public, this URL will be accessible directly:
  const url = `https://${env.ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  return new Response(JSON.stringify({ url }), {
    headers: { 'Content-Type': 'application/json' }
  });
}