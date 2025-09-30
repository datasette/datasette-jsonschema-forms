import { h, render } from "preact";
import { UiIndexParams } from "../contract";

function IndexPage({params}: { params: UiIndexParams }) {
  return <div>
    <h1>JSON Schema Forms</h1>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Database</th>
          <th>Table</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {params.forms.map(form => (
          <tr key={form.id}>
            <td>
              {form.created_at}
            </td>
            <td>
              <a href={`/-/jsonschema-forms/form/${form.name}`}>{form.name}</a>
            </td>

            <td>
              <a href={`/${form.database_name}`}>{form.database_name}</a>
            </td>
            <td>
              <a href={`/${form.database_name}/${form.table_name}`}>{form.table_name}</a>
            </td>
            <td>
              <a href={`/forms/${form.id}/edit`}>Edit</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <a href="/-/jsonschema-forms/new"><button>Create new form</button></a>
  </div>
}

export default function (params: UiIndexParams) {
  render(
    <IndexPage params={params}/>,
    document.getElementById('app')!
  );
}