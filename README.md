# 4l.db

**4l.db** is a lightweight, JSON-based database module for Node.js. It provides basic database functionality such as saving, finding, updating, and deleting data with schema validation and caching support. This module is perfect for small applications or when you need a simple, file-based database without the overhead of setting up a full-fledged database system.

## Features

- **JSON-based storage**: Data is stored in a `.json` file, making it easy to manage.
- **Schema support**: Define and enforce schemas for collections, ensuring consistent data.
- **Caching**: Improved performance by caching frequently accessed data in memory.
- **CRUD operations**: Supports Create, Read, Update, and Delete (CRUD) operations on collections.
- **Custom file paths**: Customize the file path of your database file.

## Installation

To install `4l.db`, simply use npm:

```bash
npm install 4l.db
```

## Usage
#### Importing and creating an instance
```javascript
import Database from '4l.db';

const db = new Database('myDatabase.json');  // Optionally specify your own database file path
```
#### Defining a Schema
Before saving data, you can define a schema for a collection:
```javascript
await db.defineSchema('users', {
    id: 'string',
    name: 'string',
    email: 'string'
});
```
#### Saving Data
You can save data to a collection after defining a schema:
```javascript
await db.save('users', {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
});
```
#### Finding Data
You can find multiple documents that match a query:
```javascript
const users = await db.find('users', { name: 'John Doe' });
```
Or find a single document:
```javascript
const user = await db.findOne('users', { id: '1' });
```
#### Updating Data
You can update documents using various operators like `$set`, `$inc`, and `$push`:
```javascript
await db.update('users', { id: '1' }, { $set: { name: 'John Smith' } });
```
#### Deleting Data
You can delete documents based on a query:
```javascript
await db.delete('users', { id: '1' });
```

#### License
This project is licensed under the MIT License

#### Contributing
Feel free to fork this repository, open issues, and submit pull requests. Contributions are welcome!

#### Author
- [Tuna4l](https://github.com/tuna4ll)

#### Repository
https://github.com/tuna4ll/4l-db