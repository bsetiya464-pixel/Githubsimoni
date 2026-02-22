function connectToDatabase() {
  // Connect to your database
  const dbUrl = 'YOUR_DATABASE_URL';
  const dbUser = 'YOUR_USERNAME';
  const dbPassword = 'YOUR_PASSWORD';

  const conn = Jdbc.getConnection(dbUrl, dbUser, dbPassword);
  return conn;
}

function getData() {
  const conn = connectToDatabase();
  const stmt = conn.createStatement();

  const results = stmt.executeQuery('SELECT * FROM your_table');
  const data = [];

  while (results.next()) {
    data.push({
      id: results.getInt('id'),
      name: results.getString('name')
    });
  }

  results.close();
  stmt.close();
  conn.close();

  return data;
}

function insertData(name) {
  const conn = connectToDatabase();
  const stmt = conn.prepareStatement('INSERT INTO your_table (name) VALUES (?)');

  stmt.setString(1, name);
  const result = stmt.executeUpdate();

  stmt.close();
  conn.close();

  return result;
}