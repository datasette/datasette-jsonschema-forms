import {ApiNewParams} from "./contract";

// helper function to suss out "real" datasette errors
async function resultOf(response: Response) {
  const data: { ok: boolean; errors?: string[] } = await response.json();
  if (response.status < 200 || response.status > 299 || !data.ok) {
    throw Error(data.errors ? data.errors.join(", ") : "Unknown error");
  }
  return data;
}

export let BASE_URL = "/";

export async function insertRow(
  db: string,
  table: string,
  row: { [key: string]: any }
) {
  return fetch(`${BASE_URL}${db}/${table}/-/insert`, {
    method: "POST",
    //credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ row }),
  }).then(resultOf);
}


export async function listDatabases(
) {
  const data = fetch(`${BASE_URL}.json`, {
    credentials: "include",
  }).then(resultOf);
}

export async function newJsonSchemaForm(formData: FormData) {
    const body: ApiNewParams = {
      name: formData.get("name") as string,
      database_name: formData.get("database_name") as string,
      table_name: formData.get("table_name") as string,
      schema: formData.get("schema") as string,
    }
    const response = await fetch(`${BASE_URL}-/jsonschema-forms/api/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.error || 'Failed to create form');
    }
    return response;
  }
