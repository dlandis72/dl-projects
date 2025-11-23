const crypto = require('crypto');
const readline = require('readline');
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
      console.log('Database loaded from file');
    } else {
      console.log('New database created');
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

// Initialize
loadDatabase();

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
async function processInput(input) {
  try {
    console.log('\n--- Processing Input ---');
    console.log('Original:', input);
    
    // Transform the input
    const { original, transformed, hash } = transformInput(input);
    console.log('Transformed:', transformed);
    console.log('Hash:', hash.substring(0, 16) + '...');
    
    // Check if it exists
    const exists = checkExists(transformed);
    
    if (exists) {
      console.log('❌ Entry already exists in database - not added');
      return false;
    } else {
      // Insert into database
      const id = insertEntry(original, transformed, hash);
      console.log(`✅ New unique entry added to database (ID: ${id})`);
      return true;
    }
  } catch (error) {
    console.error('Error processing input:', error.message);
    return false;
  }
}

// Display all entries
function showAllEntries() {
  console.log('\n--- All Database Entries ---');
  if (database.entries.length === 0) {
    console.log('No entries in database');
  } else {
    // Sort by created_at descending
    const sorted = [...database.entries].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    sorted.forEach((entry) => {
      console.log(`ID: ${entry.id} | Original: "${entry.original_input}" | Transformed: "${entry.transformed_input}"`);
    });
  }
}

// Main interactive loop
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('=== User Input Database App ===');
  console.log('Commands:');
  console.log('  - Type any text to add to database');
  console.log('  - Type "list" to show all entries');
  console.log('  - Type "exit" to quit\n');

  const prompt = () => {
    rl.question('Enter input: ', async (input) => {
      const trimmed = input.trim();
      
      if (trimmed === 'exit') {
        console.log('\nSaving database and exiting...');
        saveDatabase();
        rl.close();
        process.exit(0);
      } else if (trimmed === 'list') {
        showAllEntries();
        prompt();
      } else if (trimmed === '') {
        console.log('Please enter some text');
        prompt();
      } else {
        await processInput(trimmed);
        prompt();
      }
    });
  };

  prompt();
}

// Start the app
main();
