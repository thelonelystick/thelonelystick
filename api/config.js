export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({error: "Method not allowed"});
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    return response.status(500).json({error: "Runtime configuration is missing"});
  }

  response.setHeader("Cache-Control", "private, no-store");
  return response.status(200).json({
    supabaseUrl,
    supabasePublishableKey
  });
}
