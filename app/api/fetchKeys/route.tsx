import { NextResponse } from 'next/server';

export async function GET() {
  const providerKey = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!providerKey || !privateKey) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  return NextResponse.json({ providerKey, privateKey });
}
