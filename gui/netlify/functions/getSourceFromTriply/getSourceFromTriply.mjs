import App from "@triply/triplydb";
import N3 from 'n3'


export const handler = async function (event,context){

     // check api key
    const apiKey = event.headers["x-edge-message"];
    const secretKey = process.env.X_API_KEY;
    if (!apiKey || apiKey !== secretKey) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: Invalid key" }),
        };
    }

    const iri = JSON.parse(event.body)
    const token = process.env.TRIPLY_KEY_R;

    const prefixes = {
    calc: 'http://ontology.tno.nl/normengineering/calculemus#',
    choppr: 'http://ontology.tno.nl/normengineering/choppr#',
    co: 'http://purl.org/co/',
    editor: 'http://ontology.tno.nl/normengineering/editor#',
    flint: 'http://ontology.tno.nl/normengineering/flint#',
    oa: 'http://www.w3.org/ns/oa#',
    owl: 'http://www.w3.org/2002/07/owl#',
    prov: 'http://www.w3.org/ns/prov#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    src: 'http://ontology.tno.nl/normengineering/source#',
    xsd: 'http://www.w3.org/2001/XMLSchema#'
}

    const triply = App.get({ token: token });

    const user = await triply.getAccount('TNO')
    const dataset = await user.getDataset('editor')
    const graph = await dataset.getGraph(iri.iri)

    // Alternatively, get the turtle as a string
    const store = await graph.toStore()
    const writer = new N3.Writer({ format: 'text/turtle', prefixes })
    store.forEach(quad => writer.addQuad(
        quad.subject,
        quad.predicate,
        quad.object
    ))

    let ttlString = null;
    // Print the output
    writer.end((error, output) => {
        if (error) {
            console.error('Error exporting:', error)
        } else {
            // output is a string, this can be sent to unwrap-api
            ttlString = output
        }
    })

    if (ttlString){
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Source retreived!", source: ttlString})}
    }else {
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Issue with the turtle file!"})
        }
    }
}
