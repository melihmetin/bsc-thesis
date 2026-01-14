import App from '@triply/triplydb'
import N3 from 'n3'

export const handler = async function(event, context) {

    // check api key
    const apiKey = event.headers["x-edge-message"];
    const secretKey = process.env.X_API_KEY;
    if (!apiKey || apiKey !== secretKey) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Unauthorized: Invalid key" }),
        };
    }

    const token = process.env.TRIPLY_KEY_W
    const triply = App.get({token: token})

    const user = await triply.getAccount('TNO')
    const dataset = await user.getDataset('editor')

    //retrieve sent data
    const data = JSON.parse(event.body)

    // Get existing graphs from triple store
    const existing_graphs = (await dataset.getGraphs().toArray()).map(graph => graph.graphName)

    // Add data to a local store
    const parser = new N3.Parser({format: 'application/trig'});
    const local_store = new N3.Store()
    const quads = parser.parse(data.task)
    local_store.addQuads(quads)

    // Remove graphs from the local store that already exist online
    local_store.getGraphs().forEach(graph => {
        if (existing_graphs.includes(graph.value)) {
            // This graph already exists online, remove it from our local store before uploading
            local_store.removeQuads(local_store.getQuads(null, null, null, graph.value))
        }
    });

    if (local_store.size > 0) {
        // Upload the remaining graphs to the triple store
        await dataset.importFromStore(local_store)
        return {
            statusCode: 200,
            body: JSON.stringify({message: "Task saved!"})
        }
    } else {
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Error!"})
        }
    }
}


