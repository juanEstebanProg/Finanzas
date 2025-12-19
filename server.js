const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

// Configuración de seguridad
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: 'Demasiados requests, intenta nuevamente en 15 minutos'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://juanEstebanProg.github.io',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'finanzas-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'Ov23liqB783oprtrrWG',
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'https://tu-backend-url.com/auth/github/callback',
  scope: ['repo', 'gist']
}, (accessToken, refreshToken, profile, done) => {
  // Guardar token de GitHub
  profile.accessToken = accessToken;
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    username: user.username,
    accessToken: user.accessToken
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Middleware de autenticación
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autenticado' });
};

// Función para crear Gist
async function createGist(accessToken, content, filename = 'finanzas-data.json') {
  const response = await axios.post('https://api.github.com/gists', {
    description: 'Datos de Finanzas Personales',
    public: false,
    files: {
      [filename]: {
        content: JSON.stringify(content, null, 2)
      }
    }
  }, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  return response.data;
}

// Función para actualizar Gist
async function updateGist(accessToken, gistId, content, filename = 'finanzas-data.json') {
  const response = await axios.patch(`https://api.github.com/gists/${gistId}`, {
    files: {
      [filename]: {
        content: JSON.stringify(content, null, 2)
      }
    }
  }, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  return response.data;
}

// Función para obtener Gist
async function getGist(accessToken, gistId) {
  const response = await axios.get(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  return response.data;
}

// RUTAS DE AUTENTICACIÓN

// Iniciar OAuth
app.get('/auth/github', passport.authenticate('github', {
  scope: ['repo', 'gist']
}));

// Callback OAuth
app.get('/auth/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/login?error=oauth_failed' 
  }),
  (req, res) => {
    // Redirigir al frontend con confirmación
    res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
  }
);

// Logout
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al destruir sesión' });
      }
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  });
});

// Verificar autenticación
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        username: req.user.username,
        id: req.user.id
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// RUTAS DE DATOS

// Obtener datos del usuario
app.get('/api/data', ensureAuth, async (req, res) => {
  try {
    const userData = req.session.userData || {};
    const gistId = userData.gistId;
    
    if (!gistId) {
      // No hay datos, retornar datos vacíos
      return res.json({
        movements: [],
        debts: {
          debo: [],
          meDeben: []
        }
      });
    }
    
    // Obtener datos del Gist
    const gist = await getGist(req.user.accessToken, gistId);
    
    if (gist.files['finanzas-data.json']) {
      const content = JSON.parse(gist.files['finanzas-data.json'].content);
      res.json(content);
    } else {
      res.json({
        movements: [],
        debts: {
          debo: [],
          meDeben: []
        }
      });
    }
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Guardar datos del usuario
app.post('/api/data', ensureAuth, async (req, res) => {
  try {
    const data = req.body;
    const userData = req.session.userData || {};
    const gistId = userData.gistId;
    
    // Validar datos
    if (!data.movements || !data.debts) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    
    let gist;
    
    if (gistId) {
      // Actualizar Gist existente
      gist = await updateGist(req.user.accessToken, gistId, data);
    } else {
      // Crear nuevo Gist
      gist = await createGist(req.user.accessToken, data);
      
      // Guardar Gist ID en la sesión
      req.session.userData = {
        gistId: gist.id,
        createdAt: new Date().toISOString()
      };
    }
    
    res.json({ 
      success: true, 
      gistId: gist.id,
      url: gist.html_url 
    });
  } catch (error) {
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Sincronizar datos (obtener desde GitHub)
app.post('/api/sync', ensureAuth, async (req, res) => {
  try {
    const userData = req.session.userData || {};
    const gistId = userData.gistId;
    
    if (!gistId) {
      return res.json({ 
        message: 'No hay datos para sincronizar',
        data: {
          movements: [],
          debts: {
            debo: [],
            meDeben: []
          }
        }
      });
    }
    
    const gist = await getGist(req.user.accessToken, gistId);
    
    if (gist.files['finanzas-data.json']) {
      const content = JSON.parse(gist.files['finanzas-data.json'].content);
      res.json({ 
        success: true, 
        data: content,
        syncedAt: new Date().toISOString()
      });
    } else {
      res.json({
        message: 'No hay datos en GitHub',
        data: {
          movements: [],
          debts: {
            debo: [],
            meDeben: []
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al sincronizar:', error);
    res.status(500).json({ error: 'Error al sincronizar datos' });
  }
});

// RUTAS DE INFORMACIÓN

// Estado del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rate limits info
app.get('/api/limits', (req, res) => {
  res.json({
    githubApi: {
      requestsPerHour: 5000,
      authenticated: req.isAuthenticated()
    },
    app: {
      requestsPer15Min: 100,
      requestsUsed: 'N/A' // En producción usar Redis para tracking real
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'https://juanEstebanProg.github.io'}`);
  console.log(`🔐 GitHub Client ID: ${process.env.GITHUB_CLIENT_ID || 'No configurado'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
