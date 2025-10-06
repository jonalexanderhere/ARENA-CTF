import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Signup request body:', body);
    
    const { alias, password, name, teamName, teamCode, teamOption, teamIcon, teamColor } = body;
    
    // Validate required fields
    if (!alias || !password || !name) {
      console.log('Missing required fields:', { alias: !!alias, password: !!password, name: !!name });
      return NextResponse.json({ error: 'Alias, password, and name are required' }, { status: 400 });
    }
    
    if (!teamOption) {
      console.log('Missing teamOption');
      return NextResponse.json({ error: 'Team option is required' }, { status: 400 });
    }

    // Enforce max length constraints
    if (alias && alias.length > 32) {
      return NextResponse.json({ error: 'Alias must be at most 32 characters' }, { status: 400 });
    }
    if (password && password.length > 128) {
      return NextResponse.json({ error: 'Password must be at most 128 characters' }, { status: 400 });
    }
    if (name && name.length > 48) {
      return NextResponse.json({ error: 'Name must be at most 48 characters' }, { status: 400 });
    }
    if (teamName && teamName.length > 32) {
      return NextResponse.json({ error: 'Team name must be at most 32 characters' }, { status: 400 });
    }
    if (teamCode && teamCode.length > 12) {
      return NextResponse.json({ error: 'Team code must be at most 12 characters' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        alias: alias
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if this is the first user
    const userCount = await prisma.user.count();
    const isAdmin = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);

    let teamId = null;
    let isTeamLeader = false;

    if (teamOption === 'create') {
      // Create new team
      if (!teamName || teamName.trim() === '') {
        console.log('Missing team name for create option');
        return NextResponse.json(
          { error: 'Team name is required when creating a new team' },
          { status: 400 }
        );
      }

      // Check if team name already exists (case-insensitive for SQLite compatibility)
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: teamName.trim()
        }
      });

      if (existingTeam) {
        console.log('Team name already exists:', teamName);
        return NextResponse.json(
          { error: 'Team name already exists. Please choose a different name.' },
          { status: 400 }
        );
      }

      // Generate a unique team code
      let code;
      let isCodeUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isCodeUnique && attempts < maxAttempts) {
        code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const existingCode = await prisma.team.findFirst({
          where: { code }
        });
        isCodeUnique = !existingCode;
        attempts++;
      }
      
      if (!isCodeUnique) {
        return NextResponse.json(
          { error: 'Unable to generate unique team code. Please try again.' },
          { status: 500 }
        );
      }

      const team = await prisma.team.create({
        data: {
          name: teamName,
          code: code,
          icon: teamIcon || 'GiSpaceship',
          color: teamColor || '#ffffff'
        },
      });

      teamId = team.id;
      isTeamLeader = true;
    } else if (teamOption === 'join') {
      // Join existing team
      if (!teamCode || teamCode.trim() === '') {
        console.log('Missing team code for join option');
        return NextResponse.json(
          { error: 'Team code is required when joining a team' },
          { status: 400 }
        );
      }

      const team = await prisma.team.findFirst({
        where: {
          code: teamCode
        }
      });

      if (!team) {
        return NextResponse.json(
          { error: 'Invalid team code' },
          { status: 400 }
        );
      }

      teamId = team.id;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        alias,
        password: hashedPassword,
        name,
        isAdmin,
        teamId,
        isTeamLeader,
      },
    });

    // Return success with credentials for auto-login
    return NextResponse.json({
      success: true,
      user: {
        alias: user.alias,
        password: password // Send back original password for auto-login
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed on the fields: (`name`)')) {
        return NextResponse.json(
          { error: 'Team name already exists. Please choose a different name.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Unique constraint failed on the fields: (`alias`)')) {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a different alias.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'User or team already exists' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid value')) {
        return NextResponse.json(
          { error: 'Invalid input data' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}