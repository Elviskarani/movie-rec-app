import { NextRequest, NextResponse } from 'next/server';
import { getStorageItem } from '@/lib/storage';
import { generateToken } from '@/lib/jwt';
import { UserWithPassword, User } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get users from storage (using async version)
    const users = await getStorageItem<UserWithPassword[]>('users') || [];
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create user object without password
    const user: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}