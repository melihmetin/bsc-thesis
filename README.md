# Rule editor

**The Rule Editor** is an application built using web-based technologies that allows users to create interpretations of 
sources of norms in FLINT in a user-friendly and interactive way. The tool was built using [Vue.js](https://vuejs.org/) and [Quasar](https://quasar.dev/).
The app is deployed on [Netlify](https://www.netlify.com/) and uses Netlify functions (serverless functions, including Edge Functions) to extend back-end capabilities.

**Try it out**

There are two public versions of the Rule Editor available:

- Stable version: 
  The most stable release hosted at https://rule-editor.netlify.app/.
- Latest (preview) version:
  Includes the newest features and experimental changes (not fully tested or stable) hosted at https://develop--rule-editor.netlify.app/.

Feel free to explore both!


## Table of Contents

1. [Application Overview](#application-overview)
2. [Features](#features)
3. [User Manual](#user-manual)
4. [Data Model](#data-model)
5. [Getting Started](#getting-started)
6. [Codebase Structure](#codebase-structure)
7. [Development](#development)
8. [Environment Variables](#environment-variables)
9. [Contributing](#contributing)
10. [License](#license)


## Application Overview

The Rule Editor is a web application for interpreting normative tasks. To use the editor, a task is defined and the normative text (sources) describing the task and the constraints for its execution are collected and imported into the editor. The editor allows users to mark components (e.g., articles, sections, or sentences) of the source as relevant or irrelevant to the task. Relevant sources can be annotated and used as building blocks for the interpretation.

The current version of the Editor enables users to express interpretations in FLINT. The Editor is designed to be easily extendable for other interpretation schemes. It allows users to get automated recommendations, while working on their interpretation by using the [FlintFiller](https://gitlab.com/normativesystems/flintfillers/flintfiller-srl). This feature is experimental and available only for Dutch texts.

The Editor uses normative text in JSON or RDF format, according to the [Source of Norms Ontology](https://gitlab.com/normativesystems/knowledge-modeling/source-ontology). Text documents in .txt, .xml, or .html format can be translated into this format by [the Choppr tool](https://gitlab.com/normativesystems/choppr/choppr-standalone/-/blob/main/FAQ.md).

Interpretations made using the Rule Editor can be stored as JSON or TriG files locally on your computer or remotely to a [linked database/triple store](https://triplydb.com/). When choosing a Linked Data output, interpretation data conforms to the [FLINT ontology](https://gitlab.com/normativesystems/knowledge-modeling/flint-ontology). Linked Data on interpretations, sources, and the related task is bundled in the output according to the [Calculemus ontology](https://gitlab.com/normativesystems/knowledge-modeling/calculemus-ontology).

## Features

- User interface built using modern technologies, specifically [Vue.js](https://vuejs.org/) (front-end framework) & [Quasar](https://quasar.dev/) (UI Components & Toolkit).
- Serverless back-end with [Netlify Functions](https://docs.netlify.com/functions/overview/) (API endpoints).
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)(Edge middleware) for middleware-like behaviour.
- Easy deployment and continuous integration with [Netlify](https://www.netlify.com/) (Hosting & CI/CD).
- Store, share, and use interpretations locally in JSON or TriG formats, and publish as linked data knowledge graphs to the [TriplyDB platform](https://triplydb.com/).
- [Automated recommendations for interpretations using FlintFiller](https://gitlab.com/normativesystems/flintfillers/flintfiller-srl/-/tree/v3.1.0?ref_type=tags) (experimental feature, Dutch language only)

## User Manual

### Interface overview

The interface of the Rule Editor consists of five main views:
1. Set task
2. Collect sources
3. Interpret sources
4. Make interpretations executable (not yet in use)
5. Execute task (not yet in use)

Navigate between views using the tabs at the top of the page.

### Set task (step 1)
In the current version one, it is recommended to start by defining a task and to edit three fields

| Field       | Explanation                                                    | Example                  |
| ----------- |----------------------------------------------------------------|--------------------------|
| Editor      | Field to register the name of the person using the Rule editor | John Doe                 |
| Label       | Label to refer to the task                                     | National Budget Cycle    |
| Description | Description of the task                                        | What is needed to arrive at an approved national budget? |

It is possible to navigate across all views without restrictions.

### Collect sources (step 2)
There are three ways of adding sources to the editor:

| Field                                | Explanation                                                                                                                             | Example                            |
| ------------------------------------ |-----------------------------------------------------------------------------------------------------------------------------------------| ---------------------------------- |
| Dropdown menu labelled "Add source from server"               | Field to add a source from the Rule editor server                                                                                       | General Data Protection Regulation |
| Dropdown menu labelled "Add source from Triply"               | Field to add a source from the Triply linked data store                                                                                 | General Data Protection Act              |
| Button labelled "Upload source from local filesystem" | A button that allows to add a source from local filesystem (in JSON-LD). Examples of source can be found [here](./gui/public/sources/). | AI_Act.json                |

Select the source or the sources you consider relevant in relation to the task you are working on.

Use the checkboxes to select or deselect text fragments. There are also buttons to **select all** or to **deselect all**. 

You can always get back to this screen to add additional sources, or remove redundant sources or text fragments.

Once you have selected the relevant sources for your task, you can go to the next step by clicking  the **Interpret sources** tab.

The only way to navigate between screens is by using the tabs at the top of the page.

### Interpret sources (step 3)

The interpretation screen consists of four main panes:
- **Source pane:** Contains the selected sources.
- **Source of selected frame:** Indicates the source of the selected frame.
- **Frames:** Lists the created frames by type.
- **Edit:** Where you can create and modify FLINT frames.

Each pane is collapsible, allowing you to allocate more space to the pane you are focussing on.

**Source pane**

**Expanding source text**

You can use the **expand** and **collapse** icons to show or hide the text.

**Selecting text**

Select a text fragment (from a single word to multiple lines). When your selection is complete, a modal dialog appears, allowing you to:
- Create a frame (**act**, **claim**, or **fact**), or
- Link the selected text fragment to an existing frame.

You can also click on selected lines to **delete** the selection or **open** the frame in the **Edit** pane for further analysis.

**Source of selected frame**

This pane provides an overview of the linked text fragments (per source) for the currently selected frame.

**Frames**

The **Frames** pane lists all created frames by type. You can filter frames by label using the search field at the top. Alternatively, you can switch to a network visualization, which shows how different frames are related.
Switch between **List** and **Network** views using the provided radio buttons.

**Edit** 

Here you can create, edit, and delete frames. Supported frame types are **act**, **claim**, and **fact**.

##### Facts
When starting your intepretation, begin by creating some **facts**. 

You create a **fact** by selecting a text fragment. Click on the selected fragment and click on the **fact** button. On the right-hand side of the view a **fact frame** appears.

The selected text appears in the fields **short name** and **full name**. If necessary one can make changes in the text, e.g. change the conjugation of an action from the *present perfect* to the *present simple tense*.

For **facts** with a longer text fragments, add a short name. 

A fact consists of:
- the *text fragment* from a *source*
- the *full name*, that is the same as the a literal text from the fragment, adjustments can be made regarding to:
	- the conjugation of the **action**,
	- punctuation issues,
	- making a readable sentence in case of the combination of multiple fragments from a single sentence, or even from multiple sentences,
	- making implicit information explicit (add a comment to explicitly lay down the implication).
- a *short name* for longer text fragments.

Examples are given below.

###### Fact types and roles
You can classify **facts** as one of the following: 
- **Agent**
- **Action**
- **Object**
- **Duty**

Which role a **fact** takes depends on how it is used in **act frames** or **claim frames**:
- **Agents**: can be **actors** or **recipients** in **act frames**, or **claimants/duty holders** in **claim frames**.
- **Actions** are verbs used in **act frames**.
- **Objects** are the things an **action** refers to, or the thing created or terminated as the result of a *valid act*.
- **Duties** refers to **acts** that must be executed by (or on behalf of) a **duty holder** for a **claimant**. In other words every **duty** is created by an **act** and can be terminated by another **act**.

###### An example: Article 4 and 5 GDPR
Search for **agents** (persons that can have the role of *actor*, *recipient*, *claimant*, or *duty holder*, e.g. a *processor*, a *controller*, or *data subject* ), **actions** (e.g. *processing*, *collection*, *erasure*), **objects** (e.g. *personal data*, or *collected data*), **conditions** (e.g. *1. Personal data shall be: (a) processed lawfully, fairly and in a transparent manner in relation to the data subject (‘lawfulness, fairness and transparency’);*)

The *data subject*, *processor* and *controller* can be found in Article 4(1),(7) and (8).

The action verbs that can be derived from *processing*, *collection*, *erasure* in Article 4(2) are: *process*, *collect* and *erase*.

Article 5 is about the processing of *personal data*, Article 5(1)(b) is about *collected personal data* (the result of *collecting personal data*).

The condition that *1. Personal data shall be: (a) processed lawfully, fairly and in a transparent manner in relation to the data subject (‘lawfulness, fairness and transparency’);* can, e.g., be transformed to the **long name** *personal data shall be processed lawfully, fairly and in a transparent manner in relation to the data subject (‘lawfulness, fairness and transparency’)*. The **short name** could be, e.g., *personal data shall be processed lawfully, fairly and in a transparent manner*.

##### Acts
Create **acts** in two ways:
1. Select sentences and mark them as an **act** frame,
2. Select pre-existing **fact frames** and assign them a role in an **act** frame.

To create core-acts (the combination of an *action*, the *actor* performing the action, the *object* that is acted upon and the *recipient* of the result of the action), it is advised to select whole sentences.

##### Claims
A **claim** contains:
-  a **duty**
-  a **claimant** 
- a **duty holder**.

The **claimant** holds a claim that the **duty holder** fulfills the **duty**.

A **duty** should be linked to:
- One or more **acts** that can create the **duty**
- One or more **acts** that terminate the **duty**

### Make interpretations executable (step 4)
Not yet available.

### Execute task (step 5)
Not yet available.

## Data Model

The tool uses an internal data structure that differs slightly from the JSON and RDF format in which the interpretations are stored.

The definitions of the classes used in the tool can be found in the folder `gui/src/model`. The main classes are:

- [`frame`](./gui/src/model/frame.js): This is a class representing a frame. It is the superclass of [`act`](./gui/src/model/act.js), [`fact`](./gui/src/model/fact.js), and [`claim_duty`](./gui/src/model/claimduty.js). Each frame has the following attributes:
    - **_id_**: A unique id, generated when a frame is instantiated.
    - **_typeId_**: The name of the frame's type (one of 'fact','act','claim_duty')
    - **_shortName_**: A short label as displayed in the frame list.
    - **_fullName_**: The full name of the frame, displayed when hovering the frame in the frame list.
    - **_annotations_**: A list of `annotation` objects. See below for a detailed explanation of an annotation.
    - **_comments_**: A list of `comment` objects. These are remarks and considerations that the user can store as notes attached to the frame when creating the interpretation.
- [`fact`](./gui/src/model/fact.js): A frame of type _fact_. In addition to the attributes inherited from [`frame`](./gui/src/model/frame.js) it has:
    - **_subTypeIds_**: A possibly empty list of subtype id's. A fact can have zero, one, or more subtypes. Valid subtype id's are: 'agent', 'action', 'object', 'duty', 'condition'.
    - **_subDivision_**: An object of type `booleanConstruct` representing a subdivision of a fact. A fact can consist of other facts, but not necessarily. This attribute speficies how a fact is subdivided. See below for an explanation of a booleanConstruct.
- [`act`](./gui/src/model/act.js): A frame of type _act_. In addition to the attributes inherited from `frame` it has attributes for the roles of an act frame:
    - **_action_**: An object of type `fact` representing the action of an act
    - **_actor_**: An object of type `fact` representing the actor of an act
    - **_object_**: An object of type `fact` representing the object of an act
    - **_precondition_**: A `booleanConstruct` representing a fact or a combination of facts that form the precondition of an act 
    - **_recipient_**: An object of type `fact` representing the recipient of an act
    - **_creates_**: A list of zero or more `fact` objects created by an act
    - **_terminates_**: A list of zero or more `fact` objects terminated by an act

    In addition, an act has auxiliary attributes, not part of the external data model:
    - **_activeField_**: The role of the act that is currently selected by the user
    - **_generateLabelAutomatically_**: If true, labels (_shortName_ and _fullName_) are generated automatically for the act
- [`claimduty`](./gui/src/model/claimduty.js): A frame of type _claim-duty_. In addition to the attributes inherited from `frame` it has attributes for the roles of a claim-duty frame:
    - **_duty_**: An object of type `fact` representing the duty of a claim-duty
    - **_claimant_**: An object of type `fact` representing the claimant of a claim-duty
    - **_holder_**: An object of type `fact` representing the holder of a claim-duty

    In addition, a `claim-duty` has auxiliary attributes, not part of the data model:
    - **_activeField_**: The role of the claim-duty that is currently selected by the user
    - **_generateLabelAutomatically_**: If true, labels (_shortName_ and _fullName_) are generated automatically for the claim-duty

- [`booleanConstruct`](./gui/src/model/booleanConstruct.js): This class is used to specify a combination of frames. Frames are combined using functions, e.g. boolean operators like OR and AND. A `booleanConstruct` can be nested: it can combine other boolean constructs as in: `booleanConstruct_1` AND `booleanConstruct_2`. A `booleanConstruct` is a tree, where the leafs are `facts` and all other nodes are _booleanConstructs_. It has the following attributes:
    - **_frame_**: This attributes holds a frame in case the booleanConstruct is a leaf, i.e. it is a single frame, not a combination of frames.
    - **_children_**: If the booleanConstruct is not a leaf (i.e. _frame_ is not null), this attribute is a list of booleanConstruct objects.
    - **_operatorToJoinChildren_**: The function with which to join the children, e.g. a boolean operator.
    - **_isNegated_ _(deprecated)_**: If a frame is specified, this attribute tells whether the frame should be negated (i.e. the unary boolean function NOT is applied). [DEPRECATED] This property will be removed in future versions. Use **operatorToJoinChildren** instead.

- [`sourceDocument`](./gui/src/model/sourceDocument.js): This class holds a source document, e.g. the content of a law like the _Participatiewet_. Its constructor reads a jsonLD object and parses it into a nested structure of sentence objects. The leafs of this structure are individual sentences. The nodes higher in the hierarchy represent paragraphs, chapters, etc. It has these attributes:
    - **_title_**: The title of the source document
    - **_sentenceTree_**: A nested structure of `sentence` objects

- [`sentence`](./gui/src/model/sentence.js): The text of a sentence, or a heading (i.e. label of a heading, paragraph, section). The text of a sentence (or heading) is divided in snippets (see below) so that an annotation of a frame can contain _part_ of a sentence, and not necessarily complete sentences. Its most important attributes are:
    - **_sourceDocument_**: The `sourceDocument` this sentence is part of
    - **_snippets_**: A list of `snippet` objects that comprises this sentence
    - **_children_**: If this sentence is a section or other higher-level element in the document: a list of `sentence` objects that together form this section
    
- [`snippet`](./gui/src/model/snippet.js): An atomic piece of text. The text is specified as a character range within a sentence. The snippet refers to all annotations of which it is a part. Its attributes are:
    - **_id_**: A unique identifier
    - **_sentence_**: The sentence object the snippet is part of
    - **_characterRange_**: The start and end indices of the character range within the sentence. A snippet that starts from the beginning of the sentence has start index zero
    - **_annotations_**: The annotations associated with this snippet

- [`annotation`](./gui/src/model/annotation.js): This object links snippets to a frame. The snippets form the annotation of the frame. Its attributes are:
    - **_id_**: A unique identifier
    - **_frame_**: The `frame` object that this is the annotation of
The link between snippets and annotation is stored in the snippets, see above. Auxiliary attributes used for drawing coloured lines under the source text are:
    - **_nrSnippets_**: Number of snippets of this annotation
    - **_verticalPosition_**: The vertical position of the coloured line that marks this annotation in the source text


## Codebase Structure

    .
    ├── interpretations/            # List of example interpretations
    ├── gui/                        # UI code    
    │    ├── netlify/              
    │    │      ├── edge-functions/ # Edge functions
    │    │      └── functions/      # Serverless functions
    │    ├── public/                # Static assets (favicon, robots.txt, etc.)
    │    ├── src/
    │    │     ├── assets/
    │    │     ├── components/      # The components performing functionalities are here used by the views in the views/ 
    │    │     ├── helpers/         # Reusable functions and utilities that are used by components 
    │    │     ├── model/           # The data model that the application is based on
    │    │     ├── services/        # the calls to the endpoints are defined here 
    │    │     ├── store/           # The centralized store for the components 
    │    │     ├── views/           # The main views of the UI are defined here 
    │    │     ├── App.vue          # Main Vue root component    
    │    │     └── main.js          # Application bootstrap JavaScript entry point (mounts Vue app).
    │    ├── .gitignore             # Git ignored files    
    │    ├── Dockerfile
    │    ├── .eslintrc.js           # ESLint code linting configuration.
    │    ├── .prettierrc.json       # Prettier configuration    
    │    ├── index.html             # application entry point, root DOM node   
    │    ├── package-lock.json      # Records the full, exact dependency tree and versions
    │    ├── package.json           # Project dependencies and scripts
    │    ├── .env                   # Environment variables
    │    └── vite.config.js         # Vite and dev server configuration, plugin registration
    ├── .gitignore                  # Git ignored files   
    ├── docker-compose.yml
    ├── netlify.toml                # Netlify build, functions and routing configuration
    ├── LICENSE                     # Project license
    └── README.md                   # Project documentation


## Getting started 

### Prerequisites

- [Node.js](https://nodejs.org/en) (version `18.x` or later recommended)
- [npm](https://www.npmjs.com/)
- [Netlify CLI](https://www.netlify.com/products/dev/) (version `17.38` has been used) for local function testing

### Dependencies
- To connect to TriplyDB an access token with TRIPLY is needed. You can register [here](https://triplydb.com/) and become more familiar with their environment [here](https://docs.triply.cc/triply-db-getting-started/uploading-data/).
- To use the Netlify CLI an access token to authenticate with Netlify is needed. You can obtain this token using the Netlify UI. See the [docs](https://docs.netlify.com/cli/get-started/#authentication).

To run the editor locally for development purposes. You can do the following:

### Clone the repository

```bash
git clone git@gitlab.com:normativesystems/ui/interpretation-editor.git
cd interpretation-editor
```

### Go to the gui directory

From project root, navigate to the `gui` folder:

```bash
cd gui/
```

### Install the necessary dependencies
```
npm ci
```

### Local development
Start the development server with hot reload
```bash
npm run dev
```

By default, `vite` allocates `port 5137` to serve the application. Once the app is running, you can view the UI at `localhost:5137`. If you would like to use another port, you can also pass the additional `--port=XXXX`parameter: 
```bash
npm run dev -- --port=XXXX
```

You can also pass the `--open` parameter to have the UI automatically opened in a new browser tab:

```bash
npm run dev -- --open
```

Have in mind that by following the previous steps, you will not be able to use Netlify's serverless functions. If you want to develop and test Netlify functions locally, use the following command: 
```bash
netlify dev
```
This starts both SPA and Netlify Functions with live reload.

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

### Deploy to Netlify

Want to deploy immediately to Netlify? Click this button

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://gitlab.com/normativesystems/ui/interpretation-editor)

Clicking this button will create a new repo for you that looks exactly like this one, and sets that repo up immediately for deployment on Netlify.


## Development

### Netlify functions (Serverless API)

Netlify functions are in the <code>functions/</code> directory. To test them locally with the app: 

```bash
netlify dev
```

You can then make HTTP requests to <code>/.netlify/functions/[function-name]</code>.

For adding new functions, simply create a new folder in the `/functions` folder and add an `.mjs` or `.js` file to it.

You can find more information in the [Netlify Functions docs](https://docs.netlify.com/functions/overview/).

### Netlify Edge functions

Edge functions live in <code>/.netlify/edge-fuctions/</code>. See [Netlify Edge Functions docs](https://docs.netlify.com/edge-functions/overview/).

Routing for Edge functions is configured in <code>netlify.toml</code>.


## Environment variables

The application requires several environment variables to function properly, especially for accessing external services such as TriplyDB.
Add these variables to your Netlify dashboard or a local .env file as appropriate.


| Variable        | Explanation                                                                                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| TRIPLY_KEY_R    | API key required for reading from TriplyDB (Requires the creation of an account on the TRIPLY website and they can issue one for you)                                    |
| TRIPLY_KEY_W    | API key required for writing to TriplyDB (Requires the creation of an account on the TRIPLY website and they can issue one for you)                                      |
| TRIPLY_ENDPOINT | Base URL of the TriplyDB instance/API  (Requires the creation of an account on the TRIPLY website)                                                                       |
| X_API_KEY       | Generated API key for authentication purposes. Used by the Edge function to redirect to the correct TRIPLY_DB serverless functions. Create your own.                     |
| ALLOWED_DOMAINS | The domain from which the Edge function should expect the requests. If you run a local development server, you can set the value to `http://localhost:[designated_port]` |
| VITE_X_API_KEY  | API key required for fetching NLP predictions, and converting your interpretation in RDF and JSON to save them locally. Please contact us to generate one for you.       |

Create an `.env` file in the `gui` folder and define the environment variable there. 

## Contributing

We welcome contributions of all kinds!
Whether you're fixing a bug, adding features, improving documentation, or just suggesting an idea, we’re happy to collaborate.

### How to Contribute
1. Fork this repository.
2. Clone your fork (git clone https://gitlab.com/your-username/ui/interpretation-editor.git)
3. Create a branch for your changes:
```bash
git checkout -b my-feature-or-bugfix
```
4. Install dependencies
```bash
npm install
```
5. Make your changes (and add tests if possible).
6. Commit your changes:
```bash
git commit -am 'Add some feature'
```
7. Push to your forked repository:
```bash
git push origin my-feature-or-bugfix
```
8. Open a Merge Request ([GitLab guide](https://docs.gitlab.com/user/project/merge_requests/creating_merge_requests/))


## License

This project is licensed under the <b>Apache License 2.0</b>.

See the <code>LICENSE</code> file for the details.