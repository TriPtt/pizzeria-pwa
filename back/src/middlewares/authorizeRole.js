const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé : rôle insuffisant. Le role actuel est : ' + (req.user ? req.user.role : 'non authentifié') });
    
    }
    next();
  };
};

module.exports = authorizeRole;
