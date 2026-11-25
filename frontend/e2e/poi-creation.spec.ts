import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import path from 'node:path';

const api = 'http://localhost:18080/api/v1';
const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');
const image = (name: string) => ({ name, mimeType: 'image/png', buffer: pixel });
const audioFile = path.resolve(__dirname, '../../audio/poi_1_vi.mp3');

async function apiToken(request: APIRequestContext) {
  const response = await request.post(`${api}/auth/login`, {
    data: { email: 'admin@e2e.local', password: 'E2eTest123!' },
  });
  expect(response.ok()).toBeTruthy();
  return `Bearer ${(await response.json()).token}`;
}

async function login(page: Page) {
  // Map backgrounds are decorative external dependencies; all CMS requests hit
  // the real Spring Boot server and its disposable H2 database.
  await page.route('https://*.tile.openstreetmap.org/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: pixel }));
  await page.route('https://unpkg.com/**', (route) => route.fulfill({ body: '' }));
  await page.goto('/cms/login');
  await page.locator('input[type=email]').fill('admin@e2e.local');
  await page.locator('input[type=password]').fill('E2eTest123!');
  await page.getByRole('button', { name: 'Đăng nhập hệ thống' }).click();
  await expect(page).toHaveURL(/\/cms\/dashboard/);
}

async function draft(request: APIRequestContext, token: string, name: string) {
  const response = await request.post(`${api}/admin/pois/editor`, {
    headers: { Authorization: token },
    data: {
      poi: { name, latitude: 10.7681, longitude: 106.7052, radiusMeters: 50, priority: 3 },
      translations: { vi: { name, description: 'Mô tả tiếng Việt', ttsScript: 'Kịch bản tiếng Việt' } },
    },
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).poi.id as number;
}

test('map, multilingual media, Ready, Tour/QR, bulk publication and offline package', async ({ page, request }, testInfo) => {
  const token = await apiToken(request);
  const name = `POI browser ${Date.now()}`;
  await draft(request, token, `POI lân cận ${Date.now()}`);
  const tourResponse = await request.post(`${api}/admin/tours`, {
    headers: { Authorization: token }, data: { name: `Tour ${name}`, description: 'Browser test tour' },
  });
  expect(tourResponse.ok()).toBeTruthy();
  const tour = await tourResponse.json();
  await login(page);
  await page.goto('/cms/poi/editor');
  await page.getByLabel('Tên địa danh *', { exact: true }).fill(name);
  await expect(page.getByText(/Chồng lấn với/)).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();
  await page.getByRole('region', { name: 'Bản đồ chọn vị trí POI' }).click({ position: { x: 120, y: 120 } });
  await expect(page.getByLabel('Vĩ độ *', { exact: true })).not.toHaveValue('10.7681');
  await page.getByLabel('Vĩ độ *', { exact: true }).fill('10.7681');
  await page.getByLabel('Kinh độ *', { exact: true }).fill('106.7052');
  await page.getByLabel('Mô tả (vi)', { exact: true }).fill('Nội dung tiếng Việt cho khách tham quan.');
  await page.getByLabel(/Chọn audio \(vi\)/).setInputFiles(audioFile);
  await page.getByRole('tab', { name: 'English', exact: true }).click();
  await page.getByLabel('Tiêu đề (en)', { exact: true }).fill('English browser POI');
  await page.getByLabel('Mô tả (en)', { exact: true }).fill('English visitor description.');
  await page.getByLabel('Kịch bản TTS (en)', { exact: true }).fill('Welcome to this destination.');
  await page.getByLabel(/Thêm hình ảnh/).setInputFiles([image('first.png'), image('cover.png')]);
  await page.getByRole('button', { name: 'Lưu và đánh dấu Ready', exact: true }).click();
  await expect(page).toHaveURL(/\/cms\/poi\/editor\/\d+$/);
  const id = Number(page.url().split('/').pop());
  await expect(page.getByText(/Sẵn sàng duyệt · #/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Mô tả (vi)', { exact: true })).toHaveValue('Nội dung tiếng Việt cho khách tham quan.');
  await expect(page.locator('audio')).toHaveCount(1);
  await page.getByRole('button', { name: 'Chọn làm bìa', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Đã cập nhật media.' })).toBeVisible();
  await page.getByRole('button', { name: 'Đưa lên cover.png', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Đưa lên cover.png', exact: true })).toBeDisabled();
  await page.getByLabel('Tour liên kết', { exact: true }).selectOption(String(tour.id));
  await page.getByRole('button', { name: 'Gắn Tour', exact: true }).click();
  await expect(page.getByText('Đã thêm POI vào Tour.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo QR cho POI', exact: true }).click();
  await expect(page.getByText(/Đã tạo mã QR/)).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Tải ảnh QR', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  // Media changes invalidate Ready, so recheck before central publication.
  await page.getByRole('button', { name: 'Lưu và đánh dấu Ready', exact: true }).click();
  await expect(page.getByText(/Sẵn sàng duyệt · #/)).toBeVisible();
  await page.getByRole('link', { name: 'Xuất bản & gói offline', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: `Chọn ${name}`, exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Xuất bản 1 POI đã chọn', exact: true }).click();
  await expect(page.getByText(/Số POI được xuất bản: 1/)).toBeVisible();
  const detail = await (await request.get(`${api}/app/pois/${id}?lang=en`)).json();
  expect(detail.summary.name).toBe('English browser POI');
  expect(detail.images[0].fileName).toBe('cover.png');
  expect(detail.images[0].coverImage).toBe(true);
  const version = detail.summary.version;
  await expect.poll(async () => {
    const packages = await (await request.get(`${api}/admin/offline-packages`, { headers: { Authorization: token } })).json();
    return packages.filter((pkg: { dataVersion: number; status: string }) => pkg.dataVersion === version && pkg.status === 'READY').length;
  }, { timeout: 30_000 }).toBe(7);
  await expect(page.getByRole('link', { name: /Tải ZIP/ }).first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('published-poi-offline.png'), fullPage: true });
});

test('publish gate retains the draft, and Save and Publish persists outstanding basic changes', async ({ page, request }) => {
  const token = await apiToken(request);
  const name = `POI gate ${Date.now()}`;
  await login(page);
  await page.goto('/cms/poi/editor');
  await page.getByLabel('Tên địa danh *', { exact: true }).fill(name);
  await page.getByRole('button', { name: 'Lưu và xuất bản', exact: true }).click();
  const errorAlert = page.getByRole('alert').filter({ hasText: 'Cần kiểm tra' });
  await expect(errorAlert).toContainText('Thiếu mô tả tiếng Việt.');
  await expect(errorAlert).toContainText('Cần audio tiếng Việt hoặc kịch bản TTS tiếng Việt.');
  await page.getByLabel('Mô tả (vi)', { exact: true }).fill('Đã bổ sung mô tả.');
  await page.getByLabel('Kịch bản TTS (vi)', { exact: true }).fill('Thuyết minh bằng TTS.');
  await page.getByLabel('Vĩ độ *', { exact: true }).fill('10.7777777');
  await page.getByLabel('Cooldown (phút)', { exact: true }).fill('180');
  await page.getByRole('button', { name: 'Lưu và xuất bản', exact: true }).click();
  await expect(page).toHaveURL(/\/cms\/poi\/editor\/\d+$/);
  await expect(page.getByText(/Đã xuất bản · #/)).toBeVisible();
  const id = Number(page.url().split('/').pop());
  const detail = await (await request.get(`${api}/app/pois/${id}?lang=vi`)).json();
  expect(detail.summary.latitude).toBe(10.7777777);
  expect(detail.summary.cooldownMinutes).toBe(180);
  expect(detail.ttsScript).toBe('Thuyết minh bằng TTS.');
  const search = await (await request.get(`${api}/admin/pois?search=${encodeURIComponent(name)}`, { headers: { Authorization: token } })).json();
  expect(search.content).toHaveLength(1);
});

test('retry after a partial upload reuses the draft and does not duplicate completed images', async ({ page, request }) => {
  const token = await apiToken(request);
  const name = `POI retry ${Date.now()}`;
  await login(page);
  let uploads = 0;
  await page.route('**/api/v1/admin/pois/*/images', async (route) => {
    if (route.request().method() === 'POST' && ++uploads === 2) {
      await route.fulfill({ status: 503, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type' },
        body: JSON.stringify({ message: 'Lỗi upload thử nghiệm' }) });
    } else await route.continue();
  });
  await page.goto('/cms/poi/editor');
  await page.getByLabel('Tên địa danh *', { exact: true }).fill(name);
  await page.getByLabel('Mô tả (vi)', { exact: true }).fill('Nội dung được giữ khi upload lỗi.');
  await page.getByLabel(/Thêm hình ảnh/).setInputFiles([image('completed.png'), image('retry.png')]);
  await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Cần kiểm tra' })).toContainText('Lỗi upload thử nghiệm');
  await expect(page.getByLabel('Mô tả (vi)', { exact: true })).toHaveValue('Nội dung được giữ khi upload lỗi.');
  await page.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect(page).toHaveURL(/\/cms\/poi\/editor\/\d+$/);
  const id = Number(page.url().split('/').pop());
  const saved = await (await request.get(`${api}/admin/pois/${id}/editor`, { headers: { Authorization: token } })).json();
  expect(saved.images.map((item: { fileName: string }) => item.fileName)).toEqual(['completed.png', 'retry.png']);
  expect(uploads).toBe(3);
  const search = await (await request.get(`${api}/admin/pois?search=${encodeURIComponent(name)}`, { headers: { Authorization: token } })).json();
  expect(search.content).toHaveLength(1);
});

test('audio library uploads a real file to the selected POI and language', async ({ page, request }) => {
  const token = await apiToken(request);
  const id = await draft(request, token, `POI audio ${Date.now()}`);
  await login(page);
  await page.goto('/cms/audio');
  await page.getByLabel('POI nhận audio', { exact: true }).selectOption(String(id));
  await page.getByLabel('Ngôn ngữ audio', { exact: true }).selectOption('en');
  await page.locator('#cms-audio-file').setInputFiles(audioFile);
  await page.getByRole('button', { name: 'Lưu & Tự động trích xuất thời lượng', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã tải audio và gắn vào POI thành công.');
  const saved = await (await request.get(`${api}/admin/pois/${id}/editor`, { headers: { Authorization: token } })).json();
  expect(saved.audios).toHaveLength(1);
  expect(saved.audios[0].languageCode).toBe('en');
  expect(saved.audios[0].sizeBytes).toBeGreaterThan(0);
});
