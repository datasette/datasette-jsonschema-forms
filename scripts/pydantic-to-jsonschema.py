import importlib
import json
from pydantic import BaseModel

x = []
module = importlib.import_module('.', package='datasette_jsonschema_forms').contract
for key, value in module.__dict__.items():
  #print(key, type(value))
  if isinstance(value, type) and issubclass(value, BaseModel) and key != "BaseModel":
    schema = value.model_json_schema()
    schema["title"] = key
    x.append(schema)
    #print(json.dumps(schema))
#print(json.dumps(importli))
print(json.dumps(x))