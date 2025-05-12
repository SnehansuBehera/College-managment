import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Get user from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Verify password
    let isValid = false;
    if (user.password.startsWith("$2b$")) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = password === user.password;
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 3. Get role-specific data (e.g., from professors or students table)
    const { data: userDetails, error: detailError } = await supabase
      .from(`${user.role}s`) // e.g., 'professors'
      .select("*")
      .eq("id", user.id)
      .single();

    if (detailError || !userDetails) {
      return res.status(404).json({ error: "Role-specific data not found" });
    }

    // 4. Merge both user and userDetails
    return res.status(200).json({
      message: "Login successful",
      user: {
        ...user,
        ...userDetails, // role-specific details
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    let isValid = false;
    const storedPassword = user.password;

    if (typeof storedPassword === 'string' && storedPassword.startsWith('$2b$')) {
      isValid = await bcrypt.compare(oldPassword, storedPassword);
    } else {
      isValid = oldPassword === storedPassword;
    }

    if (!isValid) return res.status(401).json({ error: 'Old password is incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('email', email);

    if (error) throw error;

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export default { login, changePassword };
