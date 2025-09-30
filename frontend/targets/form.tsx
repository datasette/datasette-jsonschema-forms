import { h, render } from "preact";
import Form from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useState } from "preact/hooks";
import { insertRow } from "../api";

const log = (type) => console.log.bind(console, type);


function ViewSchema(props: { schema: string }) {
  const [showing, setShowing] = useState(false);

  return (
    <div>
      <a onClick={() => setShowing(!showing)}>
        {showing ? "Hide" : "See"} JSON Schema
      </a>
      {showing &&
        <pre>{props.schema}</pre>}
    </div>);
}

function SchemaForm(props: { schema: string, database: string, table: string }) {
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

  return <div style={{ border: "1px solid #ccc", borderRadius: 4, padding: 10, marginTop: 20 }}>
    {submitting ? "Submitting..." : <Form
      schema={JSON.parse(schema)}
      validator={validator}
      onChange={log('changed')}
      onSubmit={onSubmit}
      onError={log('errors')}
    />}
  </div>
}
function App(props: { params: Params }) {
  const { form_name, schema, database_name: database, table_name: table } = props.params;


  return <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
    <h2>{form_name}</h2>
    <small>A <a href="/-/jsonschema-forms">JSON Schema Form</a></small>
    <p>Inserting into {" "}
      <a href={`/${database}`}>{database}</a>/
      <a href={`/${database}/${table}`}>{table}</a>

    </p>
    <SchemaForm schema={schema} database={database} table={table} />
    <ViewSchema schema={schema} />
  </div>

}

interface Params {
  schema: string;
  database_name: string;
  table_name: string;
  form_name: string;
}
export default function (params: Params) {
  console.log(params.schema)
  render(
    <App params={params} />,
    document.getElementById('app')!
  );
}