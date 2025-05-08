import { Table } from "./Table.ts";

interface User {
  id: number;
  name: string;
  age: number;
}
const usersTable = new Table<User, number>((user) => user.id);
usersTable.insert({ id: 1, name: "Alice", age: 30, });
usersTable.insert({ id: 2, name: "Bob", age: 25 });
usersTable.insert({ id: 3, name: "Bob", age: 25 });
usersTable.insert({ id: 4, name: "Charlie", age: 35 });
usersTable.insert({ id: 5, name: "Alice", age: 30 });

usersTable.update({ id: 4, name: "Bob", age: 26 });

console.log(usersTable.findByAttribute("name", "Bob"));

// const users = new Map();
// users.set(1, { id: 1, name: "Alice", age: 30 });
// users.set(2, { id: 2, name: "Bob",   age: 25 });
// users.get(2);
