// Netlify Function: /.netlify/functions/generate-eflint
// Proxies interpretation JSON to your Python microservice: ${PY_SERVICE_URL}/generate

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
      };
    }

    const baseUrl = process.env.PY_SERVICE_URL;
    if (!baseUrl) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing env var PY_SERVICE_URL" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : null;

    // Expect: { interpretation: <FLINT JSON object> }
    if (!body || typeof body !== "object" || !body.interpretation) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Bad Request. Expected JSON body: { interpretation: <object> }",
        }),
      };
    }

    const url = `${baseUrl.replace(/\/+$/, "")}/generate`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interpretation: body.interpretation }),
    });

    const text = await resp.text();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Python service returned an error",
          status: resp.status,
          detail: safeJson(text) ?? text,
        }),
      };
    }

    // Pass through the python JSON { eflint: "..." }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Proxy function crashed",
        detail: String(e?.message || e),
      }),
    };
  }
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
