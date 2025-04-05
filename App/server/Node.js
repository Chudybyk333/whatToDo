const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { body, validationResult } = require('express-validator');


//relacje
const sequelize = require('./db');
const { Op } = require('sequelize');
const { User, Group, List, Invitation } = require('./models/associations'); // Modele
const Task = require('./models/Task');

//apka
const app = express();

//logi
const Sentry = require('@sentry/node');
const morgan = require('morgan');
const AppError = require('./errors/AppError');
const logger = require('./logger');

// Konfiguracja Sentry
Sentry.init({
  dsn: "https://394f7162ed14951eb1751601ad5b8f41@o4508630583541760.ingest.de.sentry.io/4508630632693840",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const JWT_SECRET = 'your_secret_key';

// CORS
const corsOptions = {
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Ustaw na true, jeśli używasz HTTPS
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minut
    },
  })
);

app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

//Test dla sentry
app.get('/api/debug-sentry', (req, res) => {
  try {
    // Kod powodujący błąd
    throw new Error("Manually captured Sentry error!");
  } catch (error) {
    Sentry.captureException(error)
    res.status(500).send("Error reported to Sentry!");
  }
});

app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/user-id', authenticateSession, (req, res) => {
  const { userId } = req.user;
  res.status(200).json({ userId });
});

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
        errors: errors.array().map((err) => ({
          msg: err.msg || 'Validation error',
          param: err.param || 'Error',
        })),
      });
    }

    const { email, password, username } = req.body;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name: username, email, password: hashedPassword });

      res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
      Sentry.captureException(error)
      logger.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
);

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sprawdzenie, czy użytkownik podał login (brak "@") czy email
    const isEmail = email.includes('@');

    // Wyszukaj użytkownika na podstawie emaila lub loginu
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: isEmail ? email : null }, // Jeśli to email
          { name: isEmail ? null : email }, // Jeśli to login
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Weryfikacja hasła
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Ustawienie sesji i wygenerowanie tokenu
    req.session.user = { userId: user.id, email: user.email, name: user.name };
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '10m' });
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 10 * 60 * 1000 });
    res.status(200).json({ message: 'Login successful', userId: user.id });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to log in user' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.post('/api/add-group', authenticateSession, async (req, res) => {
  const { groupName } = req.body;
  const userId = req.user.userId;

  if (!groupName) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    // Tworzymy grupę
    const group = await Group.create({ name: groupName, admin_id: userId });

    // Tworzymy relację w tabeli 'list', aby przypisać admina do grupy
    await List.create({
      group_id: group.id,     // ID nowo utworzonej grupy
      user_id: userId,        // ID admina, który właśnie stworzył grupę
    });

    res.status(201).json({ message: 'Group created successfully', groupId: group.id });
  } catch (error) {
    Sentry.captureException(error);
    logger.error('Error adding group:', error);
    res.status(500).json({ error: 'Failed to add group' });
  }
});


app.get('/api/groups', authenticateSession, async (req, res) => {
  const userId = req.user.userId;

  try {
    const groups = await Group.findAll({ where: { admin_id: userId } });
    res.status(200).json(groups);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.put('/api/update-group', authenticateSession, async (req, res) => {
  const { userId } = req.user;
  const { groupId, groupName } = req.body;

  if (!groupId || !groupName) {
    return res.status(400).json({ error: 'Missing required fields: groupId or groupName' });
  }
  if (groupName === 'General') {
    return res.status(400).json({ error: 'You cannot change the name of your main group!' });
  }

  try {
    const group = await Group.findOne({ where: { id: groupId, admin_id: userId } });

    if (!group) {
      return res.status(403).json({ error: 'You are not authorized to update this group' });
    }

    group.name = groupName;
    await group.save();

    res.status(200).json({ message: 'Group name updated successfully' });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error updating group name:', error);
    res.status(500).json({ error: 'Failed to update group name' });
  }
});

app.post('/api/group/tasks', authenticateSession, async (req, res) => {
  const { groupId } = req.body;
  const { userId } = req.user;

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    const group = await Group.findOne({
      where: { id: groupId, admin_id: userId },
    });

    if (!group) {
      return res.status(403).json({ error: 'You are not authorized to view tasks for this group' });
    }

    const tasks = await Task.findAll({
      where: { groupID: groupId },
      include: { model: Group, attributes: ['name'] },
    });

    res.status(200).json(tasks);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error fetching tasks for group:', error);
    res.status(500).json({ error: 'Failed to fetch tasks for the group' });
  }
});

app.get('/api/tasks', authenticateSession, async (req, res) => {
  const userId = req.user.userId;

  try {
    const tasks = await Task.findAll({
      include: {
        model: Group,
        where: { admin_id: userId },
        attributes: ['name'],
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.put('/api/change-task-status', authenticateSession, async (req, res) => {
  const { userId } = req.user;
  const { taskId, status } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing required field: taskId' });
  }

  try {
    const task = await Task.findOne({
      where: { id: taskId },
      include: {
        model: Group,
        where: { admin_id: userId },
      },
    });

    if (!task) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

app.post('/api/group/tasks', authenticateSession, async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user.userId;

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    const tasks = await Task.findAll({
      where: { groupID: groupId },
      include: {
        model: Group,
        where: { admin_id: userId },
        attributes: ['name'],
      },
    });
    res.status(200).json(tasks);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error fetching tasks for group:', error);
    res.status(500).json({ error: 'Failed to fetch tasks for group' });
  }
});

app.post('/api/add-task', authenticateSession, async (req, res) => {
  const { userId } = req.user;
  let { name, notes, deadline, groupID } = req.body;

  logger.log('Received task data:', req.body);

  // Walidacja danych wejściowych
  if (!name || !deadline) {
    logger.error('Missing required fields: name or deadline');
    return res.status(400).json({ error: 'Missing required fields: name or deadline' });
  }

  try {
    // Przypisanie do grupy "General", jeśli nie podano `groupID`
    if (!groupID) {
      const generalGroup = await Group.findOne({
        where: { admin_id: userId, name: 'General' },
        attributes: ['id'], // Pobierz tylko ID, aby zmniejszyć obciążenie
      });

      if (!generalGroup) {
        logger.error('No "General" group found for this user');
        return res.status(400).json({ error: 'No "General" group found for this user' });
      }

      groupID = generalGroup.id;
      logger.log('Assigned groupID:', groupID);
    }

    // Sprawdź, czy użytkownik należy do grupy
    const isMember = await Group.findOne({
      where: { id: groupID },
      include: {
        model: User,
        as: 'users', // Alias musi być zgodny z definicją w relacji
        where: { id: userId },
        attributes: [], // Nie zwracaj zbędnych danych użytkownika
      },
    });

    if (!isMember) {
      logger.error('User is not a member of the group');
      return res.status(403).json({ error: 'User is not a member of the group' });
    }

    // Dodanie nowego zadania
    const newTask = await Task.create({
      name,
      notes,
      deadline,
      groupID,
      userId, // Zapisanie, kto stworzył zadanie
    });

    logger.log('Task created successfully:', newTask);
    res.status(201).json(newTask);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error while adding task:', error.message);
    res.status(500).json({ error: 'Failed to add task' });
  }
});


app.put('/api/update-task', authenticateSession, async (req, res) => {
  const { taskId, name, notes, deadline, groupID } = req.body;
  const userId = req.user.userId;

  if (!taskId || !name || !deadline || !groupID) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const task = await Task.findOne({
      where: { id: taskId },
      include: {
        model: Group,
        where: { admin_id: userId },
      },
    });

    if (!task) {
      return res.status(403).json({ error: 'You are not authorized to update this task' });
    }

    task.name = name;
    task.notes = notes;
    task.deadline = deadline;
    task.groupID = groupID;
    await task.save();

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/delete-task', authenticateSession, async (req, res) => {
  const { taskId } = req.body;
  const userId = req.user.userId;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing required field: taskId' });
  }

  try {
    const task = await Task.findOne({
      where: { id: taskId },
      include: {
        model: Group,
        where: { admin_id: userId },
      },
    });

    if (!task) {
      return res.status(403).json({ error: 'You are not authorized to delete this task' });
    }

    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.delete('/api/delete-group', authenticateSession, async (req, res) => {
  const { userId } = req.user;
  const { groupId, groupName } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: 'Missing required field: groupId' });
  }
  if (groupName === 'General') {
    return res.status(400).json({ error: 'You cannot remove your main group!' });
  }

  try {
    const group = await Group.findOne({ where: { id: groupId, admin_id: userId } });

    if (!group) {
      return res.status(403).json({ error: 'You are not authorized to delete this group' });
    }

    await sequelize.transaction(async (t) => {
      await Task.destroy({ where: { groupID: groupId }, transaction: t });
      await Group.destroy({ where: { id: groupId }, transaction: t });
    });

    res.status(200).json({ message: 'Group and associated tasks deleted successfully' });
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error deleting group and tasks:', error);
    res.status(500).json({ error: 'Failed to delete group and associated tasks' });
  }
});


// wyświetlanie użytkowników danej grupy
app.post('/api/group/users', authenticateSession, async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    // Pobieramy użytkowników przypisanych do danej grupy
    const users = await User.findAll({
      include: [
        {
          model: Group,
          as: 'groups', // Alias zdefiniowany w relacji
          where: { id: groupId }, // Ograniczamy do konkretnej grupy
          through: { attributes: [] }, // Pomijamy szczegóły tabeli pośredniczącej
          required: true, // Wymagamy dopasowania w tabeli powiązań
        },
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users for group:', error);
    res.status(500).json({ error: 'Failed to fetch users for group' });
  }
});

// dodawanie użytkowników
app.post('/api/addUserToGroup', authenticateSession, async (req, res) => {  // Dodajemy middleware authenticateSession
  try {
    const { groupId, userName } = req.body;

    // 1. Sprawdzenie, czy użytkownik o danej nazwie istnieje
    const user = await User.findOne({ where: { name: userName } });

    if (!user) {
      // Jeśli użytkownik nie istnieje, zwróć błąd
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Sprawdzenie, czy grupa istnieje
    const group = await Group.findByPk(groupId);

    if (!group) {
      // Jeśli grupa nie istnieje, zwróć błąd
      return res.status(404).json({ error: 'Group not found' });
    }

    // 3. Pobieramy ID zalogowanego użytkownika z sesji
    const senderID = req.session.user.userId;  // Zamiast "1", pobieramy z sesji

    // Tworzymy zaproszenie
    const invitation = await Invitation.create({
      senderID,
      receiverID: user.id, // ID użytkownika, którego zapraszasz
      groupID: group.id,   // ID grupy, do której użytkownik ma być dodany
    });

    // Zwracamy odpowiedź z sukcesem
    res.status(200).json({
      message: 'User added to group successfully!',
      invitation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while adding user to group.',
    });
  }
});

// Endpoint do pobierania zaproszeń dla zalogowanego użytkownika
app.get('/api/notifications', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.userId;

    // Pobieranie zaproszeń dla użytkownika (do przyjęcia lub odrzucenia)
    const invitations = await Invitation.findAll({
      where: {
        receiverID: userId,
        status: 'pending', // Zaproszenia oczekujące na akcję
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email'], // Dane nadawcy zaproszenia
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name'], // Dane grupy
        },
      ],
    });

    res.status(200).json({ invitations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Endpoint do zaakceptowania zaproszenia
app.post('/api/accept-invitation', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { invitationId } = req.body; // ID zaproszenia, które użytkownik chce zaakceptować

    // Znajdowanie zaproszenia
    const invitation = await Invitation.findByPk(invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.receiverID !== userId) {
      return res.status(403).json({ error: 'You are not the recipient of this invitation' });
    }

    // Akceptacja zaproszenia (zmiana statusu)
    invitation.status = 'accepted';
    await invitation.save();

    // Dodanie użytkownika do grupy
    await List.create({
      userID: userId,
      groupID: invitation.groupID,
    });

    res.status(200).json({ message: 'Invitation accepted, you have been added to the group!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});


// Endpoint do odrzucenia zaproszenia
app.post('/api/decline-invitation', authenticateSession, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { invitationId } = req.body; // ID zaproszenia, które użytkownik chce odrzucić

    // Znajdowanie zaproszenia
    const invitation = await Invitation.findByPk(invitationId);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.receiverID !== userId) {
      return res.status(403).json({ error: 'You are not the recipient of this invitation' });
    }

    // Odrzucenie zaproszenia (zmiana statusu)
    invitation.status = 'declined';
    await invitation.save();

    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});









// Obsługa błędów
app.use((err, req, res, next) => {
  if (!(err instanceof AppError)) {
    logger.error({ message: err.message, stack: err.stack, url: req.originalUrl });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  Sentry.captureException(err);
  logger.warn({ message: err.message, status: err.status });
  res.status(err.status).json({ error: err.message });
});

// Obsługa 404
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

// Globalna obsługa wyjątków
process.on('uncaughtException', (err) => {
  Sentry.captureException(err);
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Sentry.captureException(reason);
  logger.error('Unhandled Rejection:', reason);
});


const PORT = process.env.PORT || 3000;
app.listen(3000, async () => {
  try {
    await sequelize.sync();
    logger.info(`Server is running on port ${PORT}`);
  } catch (error) {
    Sentry.captureException(error)
    logger.error('Error syncing database:', error);
  }
});


