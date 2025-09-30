import { h, render } from "preact";
import { useEffect, useState } from "preact/hooks";
import "./new.css";
import { newJsonSchemaForm } from "../api";

interface Column {
  name: string;
  type: string;
  description: string;
  widget: string;
}

interface VisualEditorData {
  columns: {
    name: string;
    type: string;
    description: string;
    widget: string;
  }[];
}

function VisualEditor({ table }: {table: Table}) {
  const [data, setData] = useState<VisualEditorData>({columns: []});
  useEffect(() => {
    setData({
      columns: table.columns.map(c => ({
        name: c,
        type: null,
        description: '',
        widget: 'input'
      }))
    });
  }, [table]);
  
  return (
    <div className="visual-editor">
      <table className="columns-table">
        <thead>
          <tr>
            <th>Column</th>
            <th>Type</th>
            <th>Description</th>
            <th>Widget</th>
          </tr>
        </thead>
        <tbody>
          {data.columns.map((column, index) => (
            <tr key={index}>
              <td>{column.name}</td>
              <td className="type-cell">{column.type}</td>
              <td>
                <input
                  type="text"
                  className="description-input"
                  value={column.description}
                  onChange={(e) => {
                    const newColumns = [...columns];
                    newColumns[index].description = e.currentTarget.value;
                    setColumns(newColumns);
                  }}
                />
              </td>
              <td>
                <select
                  className="widget-select"
                  value={column.widget}
                  onChange={(e) => {
                    const newColumns = [...columns];
                    newColumns[index].widget = e.currentTarget.value;
                    setColumns(newColumns);
                  }}
                >
                  <option value="input">input</option>
                  <option value="textarea">textarea</option>
                  <option value="select">select</option>
                  <option value="checkbox">checkbox</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeEditor() {
  return (
    <div className="code-editor">
      <textarea
        className="form-textarea code-textarea"
        name="schema"
        placeholder='{"type": "object", "properties": {"name": {"type": "string"}, "age": {"type": "integer"}}}'
        rows={10}
      />
    </div>
  );
}

function DatabaseSelector({ onChange }: { onChange: (e: string) => void }) {
  const [databases, setDatabases] = useState<string[] | null>(null);
  
  useEffect(() => {
    fetch('/.json')
      .then(res => res.json())
      .then(data => {
        const databases = Object.keys(data.databases);
        setDatabases(databases);
        onChange(databases[0]);
      })
      .catch(err => {
        console.error('Error fetching databases:', err);
        setDatabases([]);
      });
  }, []);

  if (databases === null) {
    return <div>Loading databases...</div>;
  }
  return (<div className="form-group">
    <label className="form-label">Database:</label>
    <select 
      className="form-input" 
      name="database_name" 
      onChange={e => onChange(e.currentTarget.value)} 
      defaultValue={databases[0]}
      required>
      {databases.map(db => <option value={db}>{db}</option>)}
    </select>

  </div>
  )
}

function TableSelector({ database, onChange }: { database: string | null, onChange: (table: Table | null) => void }) {
  const [tables, setTables] = useState<Table[] | null>(null);

  useEffect(() => {
    if (!database) {
      setTables(null);
      return;
    }
    fetch(`/${database}.json`)
      .then(res => res.json())
      .then(data => {
        setTables(data.tables.map(d => ({ name: d.name, columns: d.columns })));
        onChange(data.tables.length ? { name: data.tables[0].name, columns: data.tables[0].columns } : null);
    })
  }, [database]);

  if (tables === null) {
    return <div>Loading tables...</div>;
  }

  return (
    <div className="form-group">
      <label className="form-label">
        Table:
      </label>
      <select
        required
        className="form-input"
        name="table_name"
        onChange={e => {
          const selectedTable = tables.find(t => t.name === e.currentTarget.value) || null;
          onChange(selectedTable);
        }}
      >
        {tables.map(table => <option value={table.name}>{table.name}</option>)}
      </select>
    </div>
  )

}

interface Table {
  name: string;
  columns: string[];
}
function NewFormPage() {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [columns, setColumns] = useState([
    { name: 'name', type: 'text', description: '', widget: 'textarea' },
    { name: 'age', type: 'integer', description: '', widget: 'input' },
    { name: 'grade', type: 'text', description: '', widget: 'input' }
  ]);
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    console.log(formData);

    let schema: string;
    if (activeTab === 'visual') {
      // Generate schema from columns
      const properties: any = {};
      columns.forEach(col => {
        properties[col.name] = {
          type: col.type,
          description: col.description || undefined
        };
      });
      schema = JSON.stringify({
        type: "object",
        properties
      });
    } else {
      schema = formData.get("schema") as string;
    }

    try {
      JSON.parse(schema);
    } catch (error) {
      alert('Invalid JSON schema: ' + (error as Error).message);
      return;
    }

    // Add schema to form data
    formData.set("schema", schema);

    newJsonSchemaForm(formData)
      .then(() => {
        window.location.href = '/-/jsonschema-forms';
      })
      .catch(error => {
        alert('Error: ' + (error.error || 'Failed to create form'));
      })
  };
  const [database, setDatabase] = useState<string | null>(null);
  const [table, setTable] = useState<Table | null>(null);

  return (
    <div className="new-form-container">
      <div className="back-button-container">
        <a href="/-/jsonschema-forms">
          <button className="back-button">
            Back to JSONSchema forms
          </button>
        </a>
      </div>

      <h1 className="new-form-title">Create a new JSON Schema form</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ "display": "flex", "gap": "10px" }}>
          <DatabaseSelector onChange={setDatabase} />
          <TableSelector database={database} onChange={setTable}/>
        </div>

        <div className="form-group">
          <label className="form-label">
            Name:
          </label>
          <input
            type="text"
            required
            className="form-input"
            name="name"
          />
        </div>

        <div className="schema-editor">
          <div className="tab-buttons">
            <button
              type="button"
              className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
              onClick={() => setActiveTab('visual')}
            >
              Visual Editor
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'visual' ? (
              (table ? <VisualEditor table={table} /> : <div>Loading...</div>)
            ) : (
              <CodeEditor />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
        >
          Submit
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default function () {
  render(
    <NewFormPage />,
    document.getElementById('app')!
  );
}