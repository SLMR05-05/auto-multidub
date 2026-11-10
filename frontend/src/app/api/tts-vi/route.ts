import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || new URL(origin).host !== request.headers.get('host')) {
    return new Response(null, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 1500) {
    return NextResponse.json({ error: 'Nhập từ 1 đến 1500 ký tự.' }, { status: 400 });
  }
  const root = resolve(process.cwd(), '..');
  const folder = await mkdtemp(join(tmpdir(), 'seminar-piper-'));
  const output = join(folder, 'preview.wav');
  try {
    await new Promise<void>((resolveProcess, reject) => {
      const process = execFile(
        join(root, '.piper-venv', 'Scripts', 'python.exe'),
        ['-X', 'utf8', '-m', 'piper', '-m', join(root, 'vi_VN-vais1000-medium.onnx'), '-f', output],
        { timeout: 60000, signal: request.signal },
        (error) => error ? reject(error) : resolveProcess(),
      );
      process.stdin?.on('error', reject);
      process.stdin?.end(text + '\n', 'utf8');
    });
    return new NextResponse(new Uint8Array(await readFile(output)), {
      headers: { 'Content-Type': 'audio/wav', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Piper preview failed', error);
    return NextResponse.json({ error: 'Piper không tạo được âm thanh tiếng Việt.' }, { status: 500 });
  } finally {
    await rm(folder, { recursive: true, force: true }).catch(() => undefined);
  }
}