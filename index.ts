// import { Table } from "./first_thing/Table";

// interface User {
//   id: number;
//   name: string;
//   age: number;
// }
// const usersTable = new Table<User, number>((user) => user.id);
// usersTable.insert({ id: 1, name: "Alice", age: 30, });
// usersTable.insert({ id: 2, name: "Bob", age: 25 });
// usersTable.insert({ id: 3, name: "Bob", age: 25 });
// usersTable.insert({ id: 4, name: "Charlie", age: 35 });
// usersTable.insert({ id: 5, name: "Alice", age: 30 });

// usersTable.update({ id: 4, name: "Bob", age: 26 });

// console.log(usersTable.findByAttribute("age", 30));

import {
  pipe,
  object,
  union,
  string,
  number,
  nonEmpty,
  email,
  minValue,
  maxValue,
  everyItem,
  ValiError,
} from "valibot";
import { Table } from "./second_thing/Table";

// class Schema {}

const userTable = new Table("users", {
  id: union([string(), number()]),
  name: pipe(string(), nonEmpty("Please enter your name.")),
  age: pipe(
    number(),
    minValue(18, "Must at least 18"),
    maxValue(110, "Please enter a valid age.")
  ),
  email: pipe(
    string("Your email must be a string."),
    nonEmpty("Please enter your email."),
    email("The email address is badly formatted.")
  ),
});

userTable.insert({
  id: 2,
  name: "Testing",
  age: 100,
  email: "bob@hot-m.com",
});

console.log(userTable.fields.email);
console.log(userTable.findByAttribute(userTable.fields.email, "bob@hot-m.com"));

// const usersTable = new Table(userTableSchema);
