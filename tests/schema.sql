create table if not exists students(
  id integer primary key autoincrement,
  name text not null,
  age integer,
  grade text
);
/*
{
  "title": "New Student",
  "description": "Add a new student.",
  "type": "object",
  "required": [
    "name",
    "age",
    "grade"
  ],
  "properties": {
    "name": {
      "type": "string",
      "title": "Full name"
    },
    "age": {
      "type": "integer",
      "title": "Age in years"
    },
    "grade": {
      "type": "string",
      "title": "Grade level",
      "enum": ["Freshman", "Sophomore", "Junior", "Senior"]
    }
  }
}
*/

create table if not exists  courses(
  id integer primary key,
  title text not null,
  description text
);
/*

{
  "title": "New Course",
  "description": "Add a new course.",
  "type": "object",
  "required": [
    "title",
    "description"
  ],
  "properties": {
    "title": {
      "type": "string",
      "title": "Course Title"
    },
    "description": {
      "type": "string",
      "title": "Course Description"
    }
  }
}

*/

create table if not exists  local_politicians(
  id integer primary key,
  name text not null,
  term_start date,
  term_end date,
  party text
);

/*
{
  "title": "New Local Politician",
  "description": "Add a new local politician.",
  "type": "object",
  "required": [
    "name",
    "term_start",
    "term_end",
    "party"
  ],
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name"
    },
    "term_start": {
      "type": "string",
      "format": "date",
      "title": "Term Start Date"
    },
    "term_end": {
      "type": "string",
      "format": "date",
      "title": "Term End Date"
    },
    "party": {
      "type": "string",
      "title": "Political Party",
      "enum": ["democrat", "republican", "independent", "other"]
    }
  }
}
*/