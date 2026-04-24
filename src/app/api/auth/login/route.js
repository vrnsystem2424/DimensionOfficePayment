
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sheets, spreadsheetId } from '../../config/googleSheet';  // ← अपना path check करो (config/googleSheet.js)


const ALLOWED_USER_TYPES = [
  'ADMIN',
  'VIJAY',
  'Approvel2',
  'RICHA',
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email और password जरूरी हैं' },
        { status: 400 }
      );
    }

    // Google Sheet से Users डेटा लाओ
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:D',  // Email, Password, UserType, Name
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return NextResponse.json(
        { error: 'कोई user नहीं मिला' },
        { status: 400 }
      );
    }

    // Case-insensitive email + exact password match
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const userRow = rows.slice(1).find(
      (row) =>
        row[0]?.trim().toLowerCase() === normalizedEmail &&
        row[1]?.trim() === normalizedPassword
    );

    if (!userRow) {
      return NextResponse.json(
        { error: 'गलत email या password' },
        { status: 401 }
      );
    }

    // Extract values
    const userTypeRaw = (userRow[2] || '').trim();
    const name = (userRow[3] || 'Unknown').trim();

    // UserType normalize
    let userType = userTypeRaw.toUpperCase().replace(/\s+/g, '');

    // Allowed check
    if (!ALLOWED_USER_TYPES.includes(userType)) {
      const normalizedOriginal = userTypeRaw.toUpperCase().replace(/\s+/g, '');
      if (!ALLOWED_USER_TYPES.some(allowed => 
        allowed.replace(/\s+/g, '') === normalizedOriginal
      )) {
        return NextResponse.json(
          { error: 'इस user type की अनुमति नहीं है' },
          { status: 403 }
        );
      }
      userType = normalizedOriginal;
    }

    // JWT Token
    const token = jwt.sign(
      { 
        email: normalizedEmail, 
        userType,
        name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Response
    return NextResponse.json({
      success: true,
      token,
      userType,
      name,
      message: 'Login सफल!'
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Server error. बाद में कोशिश करें।' },
      { status: 500 }
    );
  }
}