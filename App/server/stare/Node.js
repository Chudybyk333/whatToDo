const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Secret for JWT
const JWT_SECRET = 'your_secret_key';

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Use sessions
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Ustaw na true w produkcji z HTTPS
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // Sesja ważna przez 10 minut
    },
  })
);

const db = mysql.createPool({
  host: 'mysql.agh.edu.pl',
  user: 'mkuckowi',
  password: '48vfQ5Tv6uSJTGA4',
  database: 'mkuckowi',
});

// Middleware to authenticate session
const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Check session endpoint
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Not authenticated' });
});

// Get user ID route
app.get('/api/user-id', authenticateSession, (req, res) => {
  const { userId } = req.user;
  res.status(200).json({ userId });
});


// User registration route
app.post(
  '/api/register',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('username').notEmpty().withMessage('Username is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map(err => ({
            msg: err.msg || 'Validation error',
            param: err.param || 'Error'
        }))
      });
    }

        // Jeśli walidacja przeszła, obsłuż rejestrację
        const { email, password, username } = req.body;

        try {
          // Obsługa użytkownika
          const [existingUserByEmail] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
          if (existingUserByEmail.length > 0) {
            return res.status(400).json({ 
              errors: [{ msg: 'User with this email already exists', param: 'email' }]
            });
          }
    
          const [existingUserByUsername] = await db.query('SELECT * FROM users WHERE name = ?', [username]);
          if (existingUserByUsername.length > 0) {
            return res.status(400).json({ 
              errors: [{ msg: 'Username is already taken', param: 'username' }]
            });
          }
    
          const hashedPassword = await bcrypt.hash(password, 10);
    
          const [result] = await db.query(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, username]
          );
    
          const userId = result.insertId;
          const [group] = await db.query('INSERT INTO groups (name, admin_id) VALUES (?, ?)', ['General', userId]);
          
          const groupId = group.insertId; // ID nowej grupy
          const [listResult] = await db.query(
            'INSERT INTO lists (userID, groupID) VALUES (?, ?)',
            [userId, groupId]
          );

          console.log('User added to list with ID:', listResult.insertId); // Logowanie ID rekordu w tabeli list

          res.status(201).json({ message: 'User registered successfully', userId });
        } catch (error) {
          console.error('Error registering user:', error);
          res.status(500).json({
            errors: [{ msg: 'Failed to register user. Please try again later', param: 'server' }]
          });
        }
      }
    );


// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; // Pobierz dane z ciała żądania

  try {
    // Wyszukaj użytkownika po emailu lub nazwie użytkownika
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email: email },
          { name: email }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Porównaj hasło z zahashowanym hasłem w bazie danych
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Ustawienie userId w sesji
    req.session.user = { userId: user.id, email: user.email, name: user.name };

    // Generowanie tokenu JWT (opcjonalnie)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '10m' });
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 10 * 60 * 1000 });

    res.status(200).json({ message: 'Login successful', userId: user.id });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }

    console.log('Session destroyed');

      // Wyczyść ciasteczka
      res.clearCookie('connect.sid', { 
        path: '/',  // Ważne, aby użyć tego samego path
        httpOnly: true,  // Upewnij się, że to jest ustawione na httpOnly
        secure: false  // Ustaw na true w produkcji
      });
  
      res.clearCookie('token', { 
        path: '/', 
        httpOnly: true, 
        secure: false  // Ustaw na true w produkcji
      });

    console.log('Cookies cleared');
    res.status(200).json({ message: 'Logout successful' });
  });
});


// Endpoint do dodawania grupy
app.post('/api/add-group', authenticateSession, async (req, res) => {
  const { groupName } = req.body;
  const userId = req.user.userId; // Przypisanie userId z sesji

  console.log('Received data:', groupName); // Dodaj logowanie danych z frontend

  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    // Dodawanie grupy do bazy
    const [groupResult] = await db.query(
      'INSERT INTO groups (name, admin_id) VALUES (?, ?)',
      [groupName, userId]
    );

    console.log('Group added with ID:', groupResult.insertId); // Logowanie ID nowej grupy

    // Dodanie użytkownika do tabeli list, aby przypisać go do grupy
    const groupId = groupResult.insertId; // ID nowej grupy
    const [listResult] = await db.query(
      'INSERT INTO lists (userID, groupID) VALUES (?, ?)',
      [userId, groupId]
    );

    console.log('User added to list with ID:', listResult.insertId); // Logowanie ID rekordu w tabeli list

    // Wysyłanie odpowiedzi
    res.status(201).json({
      message: 'Group created and user added to list successfully',
      groupId: groupResult.insertId,
    });
  } catch (error) {
    console.error('Error adding group and user to list:', error); // Logowanie błędu
    res.status(500).json({ error: 'Failed to add group and user to list' });
  }
});

// Endpoint do pobierania grup użytkownika
app.get('/api/groups', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji

  try {
    // Pobieramy grupy, do których należy użytkownik
    const [groups] = await db.query(`
      SELECT g.id, g.name 
      FROM groups g
      JOIN lists l ON g.id = l.groupID
      WHERE l.userID = ?`, [userId]);

    // Zwracamy dane grup
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Endpoint do pobierania zadań przypisanych do grup użytkownika
app.get('/api/tasks', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji

  try {
    // Pobieramy zadania przypisane do grup, do których należy użytkownik
    const [tasks] = await db.query(`
      SELECT t.id, t.groupID, g.name as groupName, t.name, t.notes, t.deadline, t.status
      FROM tasks t
      JOIN groups g ON t.groupID = g.id
      JOIN lists l ON g.id = l.groupID
      WHERE l.userID = ?`, [userId]);

    // Zwracamy listę zadań
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Endpoint do pobierania zadań przypisanych do konkretnej grupy
app.post('/api/group/tasks', authenticateSession, async (req, res) => {
  const { groupId } = req.body; // Pobieramy groupId z ciała żądania
  const { userId } = req.user; // Pobieramy userId z sesji użytkownika
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    // Pobieramy zadania przypisane do konkretnej grupy
    const [tasks] = await db.query(`
      SELECT t.id, t.groupID, g.name as groupName, t.name, t.notes, t.deadline, t.status
      FROM tasks t
      JOIN groups g ON t.groupID = g.id
      JOIN lists l ON g.id = l.groupID
      WHERE t.groupID = ? AND l.userID = ?
    `, [groupId, userId]);

    // Zwracamy listę zadań dla grupy
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for group:', error);
    res.status(500).json({ error: 'Failed to fetch tasks for the group' });
  }
});

// Endpoint do dodawania zadań
app.post('/api/add-task', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  let { name, notes, deadline, groupID } = req.body; // Dane zadania z request body

  console.log('Received task data:', req.body); // Logowanie otrzymanych danych

  // Walidacja danych wejściowych
  if (!name || !deadline) {
    console.error('Missing required fields: name or deadline');
    return res.status(400).json({ error: 'Missing required fields: name or deadline' });
  }

  try {
    // Jeśli nie podano groupID, przypisz grupę "General"
    if (!groupID) {
      // Pobierz ID grupy "General" dla użytkownika
      const [result] = await db.query(`
        SELECT g.id
        FROM groups g
        JOIN lists l ON g.id = l.groupID
        WHERE l.userID = ? AND g.name = 'General'`, [userId]);

      if (result.length === 0) {
        console.error('No "General" group found for this user');
        return res.status(400).json({ error: 'No "General" group found for this user' });
      }

      // Przypisz znalezioną grupę
      groupID = result[0].id;
      console.log('Assigned groupID:', groupID); // Logowanie przypisanego groupID
    }

    // Sprawdź, czy użytkownik należy do danej grupy
    const [groupCheck] = await db.query(`
      SELECT 1
      FROM lists
      WHERE userID = ? AND groupID = ?`, [userId, groupID]);

    if (groupCheck.length === 0) {
      console.error('User is not a member of the group');
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Dodaj nowe zadanie do bazy danych
    const [insertResult] = await db.query(`
      INSERT INTO tasks (name, notes, deadline, status, groupID)
      VALUES (?, ?, ?, ?, ?)`, [name, notes || '', deadline, 0, groupID]);

    console.log('Task added successfully with ID:', insertResult.insertId); // Logowanie sukcesu

    // Zwróć sukces z ID nowego zadania
    res.status(201).json({ message: 'Task added successfully', taskID: insertResult.insertId });
  } catch (error) {
    console.error('Error adding task:', error); // Logowanie szczegółów błędu
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Endpoint do update'owania zadań
app.put('/api/update-task', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  const { taskId, name, notes, deadline, groupID } = req.body; // Dane zadania z request body

  // Walidacja danych wejściowych
  if (!taskId || !name || !deadline || !groupID) {
    return res.status(400).json({ error: 'Missing required fields: taskId, name, deadline' });
  }

  try {
    // Sprawdź, czy zadanie należy do użytkownika
    const [task] = await db.query(`
      SELECT 1 
      FROM tasks 
      WHERE id = ? AND groupID IN (
        SELECT groupID FROM lists WHERE userID = ?
      )`, [taskId, userId]);

    if (!task.length) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }

    // Zaktualizuj zadanie
    await db.query(`
      UPDATE tasks 
      SET name = ?, notes = ?, deadline = ?, groupID = ? 
      WHERE id = ?`, [name, notes || '', deadline, groupID, taskId]);

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.put('/api/update-group', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  const { groupId, groupName } = req.body; // Odbieramy ID grupy i nową nazwę z request body

  // Walidacja danych wejściowych
  if (!groupId || !groupName) {
    return res.status(400).json({ error: 'Missing required fields: groupId or groupName' });
  }
  if (groupName === 'General'){
    return res.status(400).json({ error: 'You cannot change name of your main group!' });
  }
  try {
    // Sprawdź, czy grupa należy do użytkownika
    const [group] = await db.query(`
      SELECT 1 
      FROM groups 
      WHERE id = ? AND admin_ID = ?`, [groupId, userId]);

    if (!group.length) {
      return res.status(403).json({ error: 'You are not authorized to update this group' });
    }

    // Zaktualizuj nazwę grupy
    await db.query(`
      UPDATE groups 
      SET name = ? 
      WHERE id = ?`, [groupName, groupId]);

    res.status(200).json({ message: 'Group name updated successfully' });
  } catch (error) {
    console.error('Error updating group name:', error);
    res.status(500).json({ error: 'Failed to update group name' });
  }
});

// Endpoint do zakreslania zadań
app.put('/api/change-task-status', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  const { taskId, status } = req.body; // Dane zadania z request body

  // Walidacja danych wejściowych
  if (!taskId) {
    return res.status(400).json({ error: 'Missing required field: taskId' });
  }

  try {
    // Sprawdź, czy zadanie należy do użytkownika
    const [task] = await db.query(`
      SELECT 1 
      FROM tasks 
      WHERE id = ? AND groupID IN (
        SELECT groupID FROM lists WHERE userID = ?
      )`, [taskId, userId]);

    if (!task.length) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }

    // Zaktualizuj zadanie
    await db.query(`
      UPDATE tasks 
      SET status = ? 
      WHERE id = ?`, [status, taskId]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});


// Endpoint do usuwania zadań
app.delete('/api/delete-task', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  const { taskId } = req.body; // ID zadania z request body

  // Walidacja danych wejściowych
  if (!taskId) {
    return res.status(400).json({ error: 'Missing required field: taskId' });
  }

  try {
    // Sprawdź, czy zadanie należy do użytkownika
    const [task] = await db.query(`
      SELECT 1 
      FROM tasks 
      WHERE id = ? AND groupID IN (
        SELECT groupID FROM lists WHERE userID = ?
      )`, [taskId, userId]);

    if (!task.length) {
      return res.status(403).json({ error: 'You are not authorized to delete this task' });
    }

    // Usuń zadanie
    await db.query(`
      DELETE FROM tasks 
      WHERE id = ?`, [taskId]);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Endpoint do usuwania grup
app.delete('/api/delete-group', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji
  const { groupId, groupName } = req.body; // ID grupy z request body
  if (!groupId) {
    return res.status(400).json({ error: 'Missing required field: groupId' });
  }
  if (groupName === 'General'){
    return res.status(400).json({ error: 'You cannot remove your main group!' });
  }
  try {
    // Sprawdź, czy grupa należy do użytkownika
    const [group] = await db.query(`
      SELECT 1 
      FROM groups 
      WHERE id = ? AND admin_ID = ?`, [groupId, userId]);

    if (!group.length) {
      return res.status(403).json({ error: 'You are not authorized to delete this group' });
    }

    // Rozpocznij transakcję
    await db.query('START TRANSACTION');

    // Usuń zadania powiązane z grupą
    await db.query(`
      DELETE FROM tasks 
      WHERE groupID = ?`, [groupId]);

    // Usuń grupę
    await db.query(`
      DELETE FROM groups 
      WHERE id = ?`, [groupId]);

    // Zatwierdź transakcję
    await db.query('COMMIT');

    res.status(200).json({ message: 'Group and associated tasks deleted successfully' });
  } catch (error) {
    // W razie błędu wycofaj transakcję
    await db.query('ROLLBACK');
    console.error('Error deleting group and tasks:', error);
    res.status(500).json({ error: 'Failed to delete group and associated tasks' });
  }
});

// Endpoint do dodawania użytkownika do grupy
app.post('/api/addUserToGroup', authenticateSession, async (req, res) => {
  const { userId } = req.user; // Pobieramy userId z sesji (zakładając, że userId jest zapisane w sesji)
  const { groupId, userName } = req.body; // groupId oraz userName przychodzą z request body

  if (!groupId || !userName) {
    return res.status(400).json({ error: 'Missing required fields: groupId or userName' });
  }

  try {
    // 1. Sprawdź, czy użytkownik istnieje w tabeli `users`
    const [user] = await db.query(`SELECT id FROM users WHERE name = ?`, [userName]);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userIdFromDb = user[0].id; // Pobieramy id użytkownika z bazy danych

    // 2. Sprawdź, czy grupa istnieje w tabeli `groups`
    const [group] = await db.query(`SELECT id FROM groups WHERE id = ?`, [groupId]);

    if (!group.length) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // 3. Sprawdź, czy użytkownik nie jest już członkiem grupy
    const [existingMember] = await db.query(`
      SELECT 1 
      FROM lists 
      WHERE userId = ? AND groupId = ?`, [userIdFromDb, groupId]);

    if (existingMember.length) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }

    // 4. Rozpocznij transakcję
    await db.query('START TRANSACTION');

    // 5. Dodaj użytkownika do grupy (tabela `lists`)
    await db.query(`
      INSERT INTO lists (userId, groupId) 
      VALUES (?, ?)`, [userIdFromDb, groupId]);

    // 6. Zatwierdź transakcję
    await db.query('COMMIT');

    res.status(200).json({ message: 'User added to group successfully!' });
  } catch (error) {
    // 7. W razie błędu wycofaj transakcję
    await db.query('ROLLBACK');
    console.error('Error adding user to group:', error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
});

// endpoint do wyswietlania użytkowników w danej grupie
app.post('/api/group/users', authenticateSession, async (req, res) => {
  const { groupId } = req.body;  // Pobieramy ID grupy z body zapytania
  if (!groupId) {
    return res.status(400).json({ error: 'Missing groupId' });
  }

  try {
    // Zapytanie do bazy danych w celu pobrania użytkowników danej grupy
    const [users] = await db.query(`
      SELECT u.id, u.name
      FROM users u
      JOIN lists l ON u.id = l.userId
      WHERE l.groupId = ?`, [groupId]);

    // Zwróć listę użytkowników
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
