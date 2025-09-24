import { h, render } from "preact";
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useState } from "preact/hooks";

// helper function to suss out "real" datasette errors
async function resultOf(response: Response) {
  const data: { ok: boolean; errors?: string[] } = await response.json();
  if (response.status < 200 || response.status > 299 || !data.ok) {
    throw Error(data.errors ? data.errors.join(", ") : "Unknown error");
  }
  return data;
}

async function insertRow(
  db: string,
  table: string,
  row: { [key: string]: any }
) {
  return fetch(`/${db}/${table}/-/insert`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  }).then(resultOf);
}

const log = (type) => console.log.bind(console, type);


function ViewSchema(props: { schema: RJSFSchema }) {
  const [showing, setShowing] = useState(false);
  
  return <div>
    <button onClick={() => setShowing(!showing)}>
      {showing ? "Hide" : "View"} JSON Schema
    </button>
    {showing && 
    <pre>{JSON.stringify(props.schema, null, 2)}</pre>}
  </div>;
}

function SchemaForm(props: { schema: RJSFSchema , database: string, table: string}) {
  const { schema, database, table } = props;
  const [submitting, setSubmitting] = useState(false);
  function onSubmit(e) {
    setSubmitting(true);
    insertRow(database, table, e.formData)
      .then(() => {
        setSubmitting(false);
        alert("Row inserted successfully");
      })
      .catch((err) => {
        setSubmitting(false);
        alert("Error inserting row: " + err.message);
      });
  }

  return <div style={{border: "1px solid #ccc", borderRadius: 4, padding: 10, marginTop: 20}}>
    {submitting ? "Submitting..." : <Form
        schema={schema}
        validator={validator}
        onChange={log('changed')}
        onSubmit={onSubmit}
        onError={log('errors')}
      />  }
  </div>
}
function App(props: {params: Params}) {
  const { form_name, schema, database_name: database, table_name: table } = props.params;
  
  
  return <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
    <h2>{form_name}</h2>
    <small>A <a href="/-/jsonschema-forms">JSON Schema Form</a></small>
    <p>Inserting into {" "}
      <a href={`/${database}`}>{database}</a>/
      <a href={`/${database}/${table}`}>{table}</a>

    </p>
      <SchemaForm schema={schema} database={database} table={table}/>
      <ViewSchema schema={schema}/>
  </div>

}

interface Params {
  schema: RJSFSchema;
  database_name: string;
  table_name: string;
  form_name: string;
}
export default function(params: Params) {
  render(
    <App params={params}/>,
    document.getElementById('app')!
  );
}