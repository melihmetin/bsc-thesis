import SuperAgent from "superagent";
import { alertWidget } from "../helpers/alertWidget.js";
import { reformatDate } from "../helpers/dateTimeFunctions.js";

export async function fetchNlpPrediction(text) {
  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": import.meta.env.VITE_X_API_KEY,
      },
      body: JSON.stringify({ text }),
    });
    console.log("response:", response);
    if (!response.ok) {
      throw new Error("An error occurred during the prediction request.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      "An error occurred during the prediction request: " + error.message,
    );
  }
}

/*
  Converts the JSON structure supported by the editor to RDF
 */
export async function convertToRDF(dataset, showWidget = true) {
  try {
    const response = await fetch("/api/wrapUp/process_and_save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": import.meta.env.VITE_X_API_KEY,
      },
      body: dataset,
    });

    if (!response.ok) {
      throw new Error("An error occurred while sending the data.");
    }

    const data = await response.text();
    if (showWidget) {
      alertWidget("success", "Successful conversion to RDF!");
    }

    return data;
  } catch (error) {
    if (showWidget) {
      alertWidget(
        "error",
        "An error occurred while converting data to rdf! Details:" +
          error.message,
      );
    }

    throw new Error(
      "An error occurred while converting data to rdf: " + error.message,
    );
  }
}

/*
  Converts RDF text to json structure as used by the editor
 */
export async function convertRDFToJSON(rdfString, json = false) {
  try {
    const response = await fetch("/api/unwrap/process_graph", {
      method: "POST",
      headers: {
        "Content-Type": "text/turtle",
        "X-API-KEY": import.meta.env.VITE_X_API_KEY,
      },
      body: rdfString,
    });

    if (!response.ok) {
      throw new Error("An error occurred while sending the data.");
    }

    return !json ? await response.text() : await response.json();
  } catch (error) {
    alertWidget(
      "error",
      "An error occurred while converting data to rdf! Details:" +
        error.message,
    );
    console.error(
      "An error occurred while converting data to rdf: " + error.message,
    );
  }
}

// retrieves the available sources stored at TriplyDB
export async function getSourceList() {
  try {
    const response = await fetch("/api/serverless/getSources", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("response:", response.status);
      // Custom message for failed HTTP codes
      if (response.status === 404) throw new Error("404, Not found");
      if (response.status === 401) throw new Error("401, Unauthorized");

      if (response.status === 500)
        throw new Error("500, internal server error");

      // For any other server error
      throw new Error(`${response.status}, ${response.statusText}`);
    } else {
      const sources = await response.json();
      return sources.sources;
    }
  } catch (error) {
    alertWidget(
      "error",
      "An error occurred while trying to retrieve the available sources from Triply. " +
        error,
    );
    console.error(
      "An error occurred while trying to retrieve the available sources from Triply. ",
      error,
    );
  }
}

//retrieves source from Triply, specified by iri
export async function getSourceFromTriply(iri) {
  try {
    const response = await fetch("/api/serverless/getSource", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ iri: iri }),
    });

    if (!response.ok) {
      // Custom message for failed HTTP codes
      if (response.status === 404) throw new Error("404, Not found");
      if (response.status === 500)
        throw new Error("500, internal server error");
      // For any other server error
      throw new Error(`${response.status}, ${response.statusText}`);
    } else {
      // Retrieve the text content of the Turtle file
      const ttlContent = await response.json();
      // convert the graph to JSONLD via the unwrap-api
      const jsonSource = await convertRDFToJSON(ttlContent.source, true);
      return jsonSource;
    }
  } catch (error) {
    alertWidget(
      "error",
      "An error occurred while trying to retrieve the source from Triply. " +
        error,
    );
    console.error(
      "An error occurred while trying to retrieve the source from Triply. ",
      error,
    );
  }
}

export async function getTasksFromTriply() {
  try {
    const tasks = await fetch("/api/serverless/getAvailableTasks");

    if (!tasks.ok) {
      // Custom message for failed HTTP codes
      if (tasks.status === 404) throw new Error("404, Not found");
      if (tasks.status === 500) throw new Error("500, internal server error");

      // For any other server error
      throw new Error(`${tasks.status}, ${tasks.statusText}`);
    } else {
      const data = await tasks.json();
      data.tasks.forEach((r) => (r.date = reformatDate(r.date)));
      return data.tasks;
    }
  } catch (error) {
    // throw new Error(error);
    //error handling
    alertWidget(
      "error",
      "An error occurred while trying to retrieve the available tasks from Triply. " +
        error,
    );
    console.error(
      "An error occurred while trying to retrieve the available tasks from Triply. " +
        error,
    );
  }
}

export async function getTaskFromTriply(iri) {
  try {
    const taskResp = await fetch("/api/serverless/getTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ iri: iri }),
    });

    if (!taskResp.ok) {
      //error handling

      // Custom message for failed HTTP codes
      if (taskResp.status === 404) throw new Error("404, Not found");
      if (taskResp.status === 500)
        throw new Error("500, internal server error");

      // For any other server error
      throw new Error(`${taskResp.status}, ${taskResp.statusText}`);
    } else {
      // alertWidget("success", "The task has been loaded successfully!");
      return taskResp.json();
    }
  } catch (error) {
    alertWidget(
      "error",
      "An error occurred while retrieving the task from Triply. " + error,
    );
    console.error(error);
  }
}

export async function saveTaskAtTriply(taskInRdf) {
  try {
    const resp = await fetch("/api/serverless/saveTaskAtTriply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: taskInRdf }),
    });

    if (!resp.ok) {
      // Custom message for failed HTTP codes
      if (resp.status === 404) throw new Error("404, Not found");
      if (resp.status === 500) throw new Error("500, internal server error");
      // For any other server error
      throw new Error(`${resp.status},${resp.statusText}`);
    } else {
      // successful request
      const data = await resp.json();
      alertWidget("success", "The task has been saved successfully!");
      return { status: resp.status, message: data.message };
    }
  } catch (error) {
    alertWidget(
      "error",
      "An error occurred while trying to save the task at TriplyDB. " + error,
    );
    console.error(error);
    return { message: error };
    // throw new Error(error);
  }
}
