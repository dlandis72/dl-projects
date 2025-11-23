# User Input Database App

A simple Node.js application that demonstrates input transformation, database checking, and conditional updates.

## Features

- **Input Transformation**: Normalizes text by trimming whitespace, converting to lowercase, and collapsing multiple spaces
- **Hash Generation**: Creates SHA-256 hash of transformed input for verification
- **Database Checking**: Checks if transformed input already exists (case-insensitive, whitespace-normalized)
- **Conditional Updates**: Only writes to database if the entry is unique
- **Interactive CLI**: Simple command-line interface for testing
- **Persistent Storage**: Data saved to JSON file for persistence across sessions

## Installation

No dependencies required! Just Node.js (built-in modules only).

## Usage

```bash
npm start
```

Or directly:
```bash
node user-input-app.js
```

### Commands

- Type any text to add it to the database
- Type `list` to show all entries
- Type `exit` to quit

## How It Works

1. **Input**: User provides text input
2. **Transform**: Input is normalized (trimmed, lowercased, spaces collapsed)
3. **Check**: App queries in-memory database for matching transformed input
4. **Write**: If unique, the entry is added with original, transformed, and hash values
5. **Persist**: Database automatically saves to `database.json` file

## Examples

```
Enter input: Hello World
✅ New unique entry added to database

Enter input: hello  world
❌ Entry already exists in database - not added

Enter input: HELLO WORLD
❌ Entry already exists in database - not added
```

## Database Schema

Entries are stored as JSON objects with the following structure:

```json
{
  "entries": [
    {
      "id": 1,
      "original_input": "Hello World",
      "transformed_input": "hello world",
      "hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "nextId": 2
}
```

## Technical Details

- **Runtime**: Node.js (built-in modules only)
- **Database**: JSON file with in-memory caching
- **Hashing**: SHA-256 via Node.js crypto module
- **Persistence**: Data stored in `database.json` file
