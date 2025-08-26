import { NextRequest, NextResponse } from 'next/server';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import { generateToken } from '@/lib/jwt';
import { UserWithPassword, User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Get existing users (using async version)
    const users = await getStorageItem<UserWithPassword[]>('users') || [];

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: UserWithPassword = {
      id: Date.now(),
      name,
      email,
      password, // In production, hash this password!
    };

    // Save user (using async version)
    users.push(newUser);
    await setStorageItem('users', users);

    // Create user object without password
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    // Generate JWT token
    const token = generateToken(user);

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user,
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}