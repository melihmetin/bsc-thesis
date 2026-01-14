// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
import SuperAgent from "superagent";

export const handler = async function (event, context) {
  // check api key
  const apiKey = event.headers["x-edge-message"];
  const secretKey = process.env.X_API_KEY;

  if (!apiKey || apiKey !== secretKey) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized: Invalid key" }),
    };
  }

  const token = process.env.TRIPLY_KEY_R;
  const endpoint = process.env.TRIPLY_ENDPOINT;
  const reply = await SuperAgent.post(endpoint)
    .set("Accept", "application/sparql-results+json")
    .set("Authorization", "Bearer " + token)
    .buffer(true)
    .send({
      query: `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX src: <http://ontology.tno.nl/normengineering/source#>
      SELECT DISTINCT ?iri ?title ?date ?editor WHERE {
        ?iri a src:Source .
        ?iri src:hasTitle ?title .
        ?iri src:editedBy ?editoriri .
        ?event src:generates ?iri ;
          src:ends ?date .
        ?editoriri rdfs:label ?editor .
      } ORDER BY DESC(?date)
      `,
    })
    .accept("json");

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Sources retrieved!",
      sources: reply.body,
    }),
  };
};
