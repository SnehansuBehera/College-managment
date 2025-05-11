import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if password is hashed or plain text
    let isValid = false;
    if (user.password.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = password === user.password;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const { data: userDetails } = await supabase
      .from(`${user.role}s`)
      .select('*')
      .eq('id', user.id)
      .single();

    return res.status(200).json({
      message: 'Login successful',
      user: {
        ...userDetails,
        role: user.role
      }
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
