export default async (request, context) => {
  const key = Netlify.env.get("X_API_KEY");

  // Check Referer Header (Only allow your frontend site)
  const allowedReferer = Netlify.env.get("ALLOWED_DOMAINS");
  const referer = request.headers.get("referer") || "";

  if (!referer.includes(allowedReferer)) {
    return new Response(
      JSON.stringify({ error: "Access denied: Invalid referer" }),
      {
        status: 403,
      },
    );
  }

  const headers = request.headers;
  const url = request.url;
  let modifiedRequest = null;

  // check whether the request contains data
  if (request.body) {
    const requestedBody = await request.json();

    // Redirect to the serverless function
    modifiedRequest = new Request(url, {
      headers: {
        ...headers,
        "x-edge-message": key,
      },
      method: "POST",
      body: JSON.stringify(requestedBody),
    });
  } else {
    // no-body
    // Redirect to the serverless function
    modifiedRequest = new Request(url, {
      headers: {
        ...headers,
        "x-edge-message": key,
      },
    });
  }

  return context.next(modifiedRequest);
};
