// Check auth status
export const authStatus = async (req, res, next) => {
  try {
    // This route will use the authenticate middleware before this controller
    // If we get here, the user is authenticated
    res.status(200).json({
      isAuthenticated: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const generateAccessToken = (user) => {
  return jwt.sign(
    {id: user.id, email: user.email, role: user.role},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN || "1h"}
  );
};
