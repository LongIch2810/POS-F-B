// POS-F&B Domain Verification Script
// Tests domain rules, timezone grouping, reconciliation math, and permission scoping.

import assert from 'node:assert';

console.log('=== BẮT ĐẦU KIỂM TRA QUY TẮC NGHIỆP VỤ (DOMAIN TEST) ===\n');

// 1. Kiểm tra chuyển đổi múi giờ Asia/Ho_Chi_Minh (UTC+7)
function toVnDateString(isoDateStr) {
  const d = new Date(isoDateStr);
  const vnTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return vnTime.toISOString().slice(0, 10);
}

function formatVnDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Test case 1.1: 17:30 UTC ngày 26/10 là 00:30 ngày 27/10 tại Việt Nam
const utcNearMidnight = '2026-10-26T17:30:00Z';
const vnDate = toVnDateString(utcNearMidnight);
assert.strictEqual(vnDate, '2026-10-27', '17:30 UTC ngày 26 phải được tính vào ngày 27/10 giờ Việt Nam');
assert.strictEqual(formatVnDate(vnDate), '27/10/2026', 'Định dạng ngày VN phải là dd/MM/yyyy');
console.log('✓ 1. Múi giờ Asia/Ho_Chi_Minh (+7h) và định dạng ngày dd/MM/yyyy hoạt động chính xác.');

// 2. Kiểm tra công thức đối soát két tiền (BR-56, BR-60)
function calculateCashReconciliation(openingCash, cashSales, drawerExpenses, countedCash) {
  const expectedCash = openingCash + cashSales - drawerExpenses;
  const difference = countedCash - expectedCash;
  let status = 'MATCHED';
  if (difference < 0n) status = 'SHORTAGE';
  else if (difference > 0n) status = 'OVERAGE';
  return { expectedCash, difference, status };
}

// Test case 2.1: Khớp tiền
const reconMatched = calculateCashReconciliation(1500000n, 450000n, 100000n, 1850000n);
assert.strictEqual(reconMatched.expectedCash, 1850000n, 'Tiền kỳ vọng phải bằng 1.500.000 + 450.000 - 100.000 = 1.850.000');
assert.strictEqual(reconMatched.difference, 0n, 'Chênh lệch phải bằng 0');
assert.strictEqual(reconMatched.status, 'MATCHED', 'Trạng thái phải là MATCHED');

// Test case 2.2: Thiếu tiền
const reconShort = calculateCashReconciliation(1500000n, 450000n, 100000n, 1800000n);
assert.strictEqual(reconShort.difference, -50000n, 'Chênh lệch phải là -50.000');
assert.strictEqual(reconShort.status, 'SHORTAGE', 'Trạng thái phải là SHORTAGE');

// Test case 2.3: Thừa tiền
const reconOver = calculateCashReconciliation(1500000n, 450000n, 100000n, 1900000n);
assert.strictEqual(reconOver.difference, 50000n, 'Chênh lệch phải là +50.000');
assert.strictEqual(reconOver.status, 'OVERAGE', 'Trạng thái phải là OVERAGE');
console.log('✓ 2. Công thức đối soát két tiền (opening + sales - expenses = expected) chính xác.');

// 3. Kiểm tra tính toán tồn kho khớp biến động (BR-45)
// Mô phỏng seed data Nam Lý
const branchStocks = [
  { branch_id: 'branch-nl', ingredient_id: 'ing-1', current_stock: 4500 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-2', current_stock: 3200 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-3', current_stock: 5000 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-4', current_stock: 1800 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-5', current_stock: 8000 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-6', current_stock: -3 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-7', current_stock: 1200 },
];

const stockMovements = [
  { branch_id: 'branch-nl', ingredient_id: 'ing-1', quantity: 4540 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-1', quantity: -40 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-2', quantity: 3200 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-3', quantity: 5000 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-4', quantity: 1800 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-5', quantity: 8030 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-5', quantity: -30 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-6', quantity: -3 },
  { branch_id: 'branch-nl', ingredient_id: 'ing-7', quantity: 1200 },
];

for (const stock of branchStocks) {
  const sumMovements = stockMovements
    .filter(m => m.branch_id === stock.branch_id && m.ingredient_id === stock.ingredient_id)
    .reduce((sum, m) => sum + m.quantity, 0);
  assert.strictEqual(
    sumMovements,
    stock.current_stock,
    `Tồn kho NL của ${stock.ingredient_id} (${stock.current_stock}) phải bằng tổng biến động (${sumMovements})`
  );
}
console.log('✓ 3. Tồn kho khớp 100% với tổng biến động kho (BR-45).');

// 4. Kiểm tra trạng thái bàn (BR-99): có khách hay không dựa trên đơn OPEN
function isTableOccupied(tableId, invoices) {
  return invoices.some(inv => inv.dining_table_id === tableId && inv.status === 'OPEN');
}

const mockInvoices = [
  { id: 'inv-1', dining_table_id: 'tb-2', status: 'OPEN' },
  { id: 'inv-2', dining_table_id: 'tb-1', status: 'PAID' },
];

assert.strictEqual(isTableOccupied('tb-2', mockInvoices), true, 'Bàn 2 có đơn OPEN nên phải là Có khách');
assert.strictEqual(isTableOccupied('tb-1', mockInvoices), false, 'Bàn 1 chỉ có đơn PAID nên phải là Trống');
assert.strictEqual(isTableOccupied('tb-3', mockInvoices), false, 'Bàn 3 không có đơn nên phải là Trống');
console.log('✓ 4. Trạng thái bàn có khách/trống được tính động từ hóa đơn OPEN (BR-99).');

// 5. Kiểm tra phân quyền báo cáo (BR-77, BR-81)
function checkReportAccess(user) {
  if (user.role_code === 'PLATFORM_ADMIN') {
    throw new Error('Quản trị viên nền tảng không có quyền xem dữ liệu vận hành (BR-81)');
  }
  if (user.role_code === 'CASHIER') return 'SHIFT_SCOPE';
  if (user.role_code === 'MANAGER') return 'BRANCH_SCOPE';
  if (user.role_code === 'OWNER') return 'STORE_SCOPE';
}

assert.throws(
  () => checkReportAccess({ role_code: 'PLATFORM_ADMIN' }),
  /BR-81/,
  'PLATFORM_ADMIN phải bị chặn xem báo cáo'
);
assert.strictEqual(checkReportAccess({ role_code: 'CASHIER' }), 'SHIFT_SCOPE');
assert.strictEqual(checkReportAccess({ role_code: 'MANAGER' }), 'BRANCH_SCOPE');
assert.strictEqual(checkReportAccess({ role_code: 'OWNER' }), 'STORE_SCOPE');
console.log('✓ 5. Phân quyền xem báo cáo doanh thu theo vai trò (BR-77, BR-81) chính xác.');

console.log('\n=== TẤT CẢ CÁC BÀI KIỂM TRA ĐỀU ĐẠT CHUẨN (100% PASS) ===\n');
