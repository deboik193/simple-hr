import User from "@/models/User";
import { extractTokenFromHeader, verifyToken } from "./auth";

/**
 * Extract and verify user from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<{user: object|null, errors: Response|null}>}
 */
export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return { user: null, errors: null }; // No token, but not an error
    }
    
    const decoded = verifyToken(token);
    
    // Fetch actual user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return { user: null, errors: Response.json({ message: 'User not found or inactive' }, { status: 401 }) };
    }

    return { user, errors: null };

  } catch (errors) {
    return { user: null, errors: Response.json({ errors: 'Invalid token' }, { status: 401 }) };
  }
}