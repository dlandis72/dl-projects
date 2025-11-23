const crypto = require('crypto');
const fs = require('fs');

// In-memory database (using Map for O(1) lookups)
const DB_FILE = './database.json';
let database = {
  entries: [],
  nextId: 1
};

// Load existing database if it exists
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      database = JSON.parse(data);
      console.log('Database loaded from file\n');
    } else {
      console.log('New database created\n');
    }
  } catch (error) {
    console.error('Error loading database:', error.message);
  }
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('Error saving database:', error.message);
  }
}

// Transform input: normalize, trim, lowercase, and create hash
function transformInput(input) {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  
  return {
    original: input,
    transformed: normalized,
    hash: hash
  };
}

// Check if entry exists in database
function checkExists(transformedInput) {
  return database.entries.some(entry => entry.transformed_input === transformedInput);
}

// Insert new entry into database
function insertEntry(original, transformed, hash) {
  const entry = {
    id: database.nextId++,
    original_input: original,
    transformed_input: transformed,
    hash: hash,
    created_at: new Date().toISOString()
  };
  
  database.entries.push(entry);
  saveDatabase();
  return entry.id;
}

// Process user input
function processInput(input) {
  console.log('--- Processing Input ---');
  console.log('Original:', input);
  
  // Transform the input
  const { original, transformed, hash } = transformInput(input);
  console.log('Transformed:', transformed);
  console.log('Hash:', hash.substring(0, 16) + '...');
  
  // Check if it exists
  const exists = checkExists(transformed);
  
  if (exists) {
    console.log('❌ Entry already exists in database - not added\n');
    return false;
  } else {
    // Insert into database
    const id = insertEntry(original, transformed, hash);
    console.log(`✅ New unique entry added to database (ID: ${id})\n`);
    return true;
  }
}

// Display all entries
function showAllEntries() {
  console.log('--- All Database Entries ---');
  if (database.entries.length === 0) {
    console.log('No entries in database\n');
  } else {
    // Sort by created_at descending
    const sorted = [...database.entries].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    sorted.forEach((entry) => {
      console.log(`ID: ${entry.id} | Original: "${entry.original_input}" | Transformed: "${entry.transformed_input}"`);
    });
    console.log();
  }
}

// Test the functionality
console.log('=== User Input Database App - Demo ===\n');

loadDatabase();

// Test 1: Add first entry
console.log('TEST 1: Adding "Hello World"');
processInput('Hello World');

// Test 2: Show all entries
showAllEntries();

// Test 3: Try to add same entry (should fail)
console.log('TEST 2: Adding "Hello World" again (should fail)');
processInput('Hello World');

// Test 4: Try variations (should all fail due to normalization)
console.log('TEST 3: Adding "HELLO WORLD" (should fail - case insensitive)');
processInput('HELLO WORLD');

console.log('TEST 4: Adding "hello  world" with extra spaces (should fail)');
processInput('hello  world');

// Test 5: Add different entry (should succeed)
console.log('TEST 5: Adding "Different Entry" (should succeed)');
processInput('Different Entry');

// Test 6: Add another unique entry
console.log('TEST 6: Adding "JavaScript is awesome!" (should succeed)');
processInput('JavaScript is awesome!');

// Final display
console.log('FINAL DATABASE STATE:');
showAllEntries();

console.log('Database saved to database.json');
