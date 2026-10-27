# BUSINESS_RULES

Danh sách business rule của hệ thống POS và kho cho quán cà phê (nhiều cửa hàng, nhiều chi nhánh). Dùng cho agent khi viết spec, code và test.

## Cách dùng

- Mỗi rule có **mã cố định `BR-xx`**. Không đánh lại số khi thêm hoặc xóa rule. Các tài liệu khác (`DESIGN.md`, spec, test) tham chiếu theo mã này.
- Rule được **nhóm theo module**, nên thứ tự số trong file không liên tục.
- Cột **GĐ**: `MVP` là làm trước, `GĐ2` là giai đoạn 2 (chỉ làm khi user yêu cầu).
- Mỗi rule cần **ít nhất một test**. Đặt tên test hoặc ghi chú có mã rule, ví dụ `BR-34: thanh toán trùng key trả kết quả cũ`.
- Rule mâu thuẫn với tài liệu khác hoặc chưa rõ thì dừng lại và hỏi user. Không tự đoán.
- Tên bảng và field xem `DESIGN_DB_POS_SYSTEM.md`. Tổng quan sản phẩm xem `PRODUCT_OVERVIEW.md`.

## Mục lục

1. Nền tảng và cô lập dữ liệu
2. Tài khoản và xác thực
3. Chi nhánh và phạm vi truy cập
4. Danh mục sản phẩm
5. Bàn
6. Ca làm
7. Chi phí trong ca
8. Đối soát tiền mặt
9. Hóa đơn
10. Thanh toán
11. Khuyến mãi
12. Kho và công thức
13. Báo cáo
14. Nhật ký thao tác
15. Ma trận quyền
16. Vòng đời trạng thái
17. Công thức tham chiếu

---

## 1. Nền tảng và cô lập dữ liệu

| Mã    | Quy tắc                                                                                                                                                                                                                                                           | GĐ                            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| BR-78 | Không có đăng ký công khai. Mọi tài khoản do cấp trên tạo.                                                                                                                                                                                                        | MVP                           |
| BR-79 | `PLATFORM_ADMIN` có `store_id` trống. Mọi người dùng khác bắt buộc có `store_id`.                                                                                                                                                                                 | MVP                           |
| BR-80 | Dữ liệu thuộc cửa hàng luôn lọc theo `store_id` **lấy từ token**, không tin tham số client. Mọi `id` trong request (món, size, topping, nguyên liệu, mã giảm giá, chi nhánh, bàn) phải thuộc cùng cửa hàng với người gọi. Bảng nối phải có hai đầu cùng cửa hàng. | MVP                           |
| BR-81 | `PLATFORM_ADMIN` quản lý cửa hàng, tài khoản `OWNER` và quyền dùng chung của các vai trò. **Không đọc dữ liệu vận hành** (hóa đơn, ca, kho, doanh thu). Truy cập hỗ trợ có thời hạn và có nhật ký là phần mở rộng. | MVP (hỗ trợ có thời hạn: GĐ2) |
| BR-82 | Cửa hàng `SUSPENDED`: từ chối đăng nhập và mọi API của người dùng thuộc cửa hàng, thu hồi refresh token, giữ nguyên dữ liệu. Mở lại thì người dùng đăng nhập lại để dùng tiếp.                                                                                    | MVP                           |
| BR-96 | Tạm khóa cửa hàng bắt buộc có lý do (`suspended_reason`) và ghi `suspended_at`.                                                                                                                                                                                   | MVP                           |

## 2. Tài khoản và xác thực

| Mã    | Quy tắc                                                                                                                                                                                           | GĐ  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| BR-01 | Mật khẩu chỉ lưu dạng băm (bcrypt hoặc argon2). Không bao giờ trả `password_hash` ra API.                                                                                                         | MVP |
| BR-02 | Tài khoản `is_active = false` không đăng nhập được, mọi refresh token của tài khoản bị từ chối.                                                                                                   | MVP |
| BR-03 | Access token sống ngắn, refresh token sống dài. Đăng xuất hoặc đổi mật khẩu thì đặt `revoked_at` cho refresh token.                                                                               | MVP |
| BR-04 | Refresh token chỉ lưu hash. Token hợp lệ khi `revoked_at IS NULL AND expires_at > now()`.                                                                                                         | MVP |
| BR-05 | Mọi API kiểm tra quyền theo `permissions.code` của vai trò, không kiểm tra theo tên vai trò cứng trong code.                                                                                      | MVP |
| BR-06 | Chỉ người có quyền mới được tạo tài khoản, khóa tài khoản, đổi vai trò. Không ai được tự khóa hay tự hạ quyền chính mình.                                                                         | MVP |
| BR-07 | Nhân viên nghỉ việc thì khóa tài khoản, **không xóa** (còn ca và hóa đơn tham chiếu).                                                                                                             | MVP |
| BR-83 | Người cấp tài khoản chỉ được cấp vai trò **thấp hơn** mình, trong phạm vi cửa hàng và chi nhánh của mình. `PLATFORM_ADMIN` cấp `OWNER`. `OWNER` cấp `MANAGER` và `CASHIER`.                       | MVP |
| BR-84 | Tài khoản mới (và tài khoản vừa đặt lại mật khẩu) có `must_change_password = true`. Mật khẩu tạm hiển thị đúng một lần cho người cấp. Người dùng phải đổi mật khẩu trước khi dùng chức năng khác. | MVP |
| BR-85 | Mỗi cửa hàng luôn có ít nhất một `OWNER` đang hoạt động. Không khóa, xóa hay hạ quyền `OWNER` cuối cùng.                                                                                          | MVP |
| BR-97 | `username` duy nhất trên toàn hệ thống.                                                                                                                                                           | MVP |
| BR-103 | Chỉ `PLATFORM_ADMIN` được chỉnh `role_permissions` dùng chung toàn nền tảng. Không được cấp quyền xem dữ liệu vận hành cho `PLATFORM_ADMIN` hoặc cấp `branch.access_all` cho vai trò khác `OWNER`. | MVP |

## 3. Chi nhánh và phạm vi truy cập

| Mã     | Quy tắc                                                                                                                                                                                                                   | GĐ  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| BR-70  | `CASHIER` và `MANAGER` bắt buộc có `branch_id`, và chi nhánh đó phải thuộc `store_id` của họ. Chỉ vai trò có `branch.access_all` (`OWNER`) hoặc `PLATFORM_ADMIN` mới được để `branch_id` trống. Kiểm tra ở tầng ứng dụng. | MVP |
| BR-71  | Người không có `branch.access_all` chỉ thao tác và xem dữ liệu **chi nhánh của mình**. Server luôn ép điều kiện này, bỏ qua `branch_id` do client gửi.                                                                    | MVP |
| BR-71b | Người có `branch.access_all` xem được mọi chi nhánh trong cửa hàng của mình, không thấy cửa hàng khác. Khi tạo hoặc sửa dữ liệu vận hành (mở ca, tạo đơn, ghi chi phí) phải chỉ rõ chi nhánh. | MVP |
| BR-76  | Chi nhánh `is_active = false` không mở ca, không tạo đơn mới. Dữ liệu cũ giữ nguyên.                                                                                                                                      | MVP |

## 4. Danh mục sản phẩm

| Mã     | Quy tắc                                                                                                                             | GĐ                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| BR-08  | Giá bán nằm ở `product_sizes.price`. Món phải có ít nhất một size mới bán được.                                                     | MVP                        |
| BR-09  | Món, size, topping `is_active = false` không hiện trên màn hình POS và không thêm được vào đơn mới. Hóa đơn cũ không bị ảnh hưởng.  | MVP                        |
| BR-10  | Dữ liệu đã có tham chiếu thì **không xóa cứng**, chỉ ngưng dùng.                                                                    | MVP                        |
| BR-11  | Topping chỉ chọn được nếu nằm trong `category_toppings` của danh mục món đó.                                                        | MVP                        |
| BR-12  | Đổi giá chỉ áp cho món **thêm vào đơn sau thời điểm đổi**. Dòng món đã thêm giữ giá snapshot.                                       | MVP                        |
| BR-13  | Giá không âm. Tên danh mục, size, topping, nguyên liệu không trùng trong cùng cửa hàng. Tên món không trùng trong cùng danh mục.    | MVP                        |
| BR-100 | Menu dùng chung toàn cửa hàng: mọi chi nhánh bán cùng menu và cùng giá. Giá và trạng thái bán riêng từng chi nhánh là phần mở rộng. | MVP (riêng chi nhánh: GĐ2) |

## 5. Bàn

| Mã     | Quy tắc                                                                                                                       | GĐ  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | --- |
| BR-74  | Mỗi bàn chỉ có **một đơn `OPEN`** tại một thời điểm. Chặn bằng partial unique index.                                          | MVP |
| BR-99  | Trạng thái bàn (trống hay có khách) **tính từ dữ liệu**: bàn có khách khi tồn tại đơn `OPEN` của bàn đó. Không lưu thành cột. | MVP |
| BR-95  | Bàn `is_active = false` hoặc thuộc chi nhánh khác không chọn được cho đơn mới.                                                | MVP |
| BR-91  | Khách ngồi chung hoặc gọi thêm: thêm món vào **đơn `OPEN` của bàn đó**, không tạo đơn thứ hai.                                | MVP |
| BR-92  | Chuyển bàn: đổi `table_id` của đơn `OPEN` sang bàn trống cùng chi nhánh.                                                      | MVP |
| BR-101 | Tách bill và gộp bill chưa hỗ trợ ở MVP. Khi làm sẽ phải đổi ràng buộc "một đơn mở mỗi bàn".                                  | GĐ2 |

## 6. Ca làm

| Mã    | Quy tắc                                                                                                                                                                              | GĐ  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| BR-14 | Mỗi người chỉ có **một ca đang mở** tại một thời điểm. Chặn bằng partial unique index theo `user_id`.                                                                                | MVP |
| BR-87 | Mỗi chi nhánh chỉ có **một ca thu ngân đang mở** (một két). Ca trước phải đóng thì ca sau mới mở được. Chặn bằng partial unique index theo `branch_id` với `shift_type = 'CASHIER'`. | MVP |
| BR-15 | `shift_type = CASHIER` giữ két, có `cash_reconciliation` và được lập hóa đơn. `STAFF` (pha chế, phục vụ) chỉ ghi giờ vào và giờ ra.                                                  | MVP |
| BR-16 | Phải có **ca thu ngân đang mở của chính mình** mới tạo được đơn và thanh toán. Mọi hóa đơn gắn `work_shift_id` của ca đó.                                                            | MVP |
| BR-17 | Ca `CLOSED` không tạo đơn, không thanh toán, không thêm chi phí, không sửa số liệu. Muốn chỉnh phải tạo bản ghi điều chỉnh.                                                          | MVP |
| BR-18 | Số giờ làm = `ended_at − started_at`. `ended_at` phải sau `started_at`.                                                                                                              | MVP |
| BR-19 | Không đóng được ca khi còn hóa đơn `OPEN` thuộc ca đó. Phải thanh toán hoặc hủy trước.                                                                                               | MVP |
| BR-20 | Ca bị quên đóng thì người có quyền `shift.force_close` đóng cưỡng chế. Bắt buộc ghi lý do và `closed_by`.                                                                            | MVP |
| BR-88 | Ca thu ngân đóng cưỡng chế vẫn phải có `counted_cash` do quản lý **đếm và nhập**. Không cho bỏ trống vì ca sau cần số này.                                                           | MVP |

## 7. Chi phí trong ca

| Mã    | Quy tắc                                                                  | GĐ  |
| ----- | ------------------------------------------------------------------------ | --- |
| BR-51 | Chỉ ghi chi phí khi ca còn `OPEN`.                                       | MVP |
| BR-52 | Mỗi khoản chi có `amount > 0` và `reason` bắt buộc.                      | MVP |
| BR-53 | Chỉ khoản có `paid_from_drawer = true` mới trừ vào tiền kỳ vọng của két. | MVP |

## 8. Đối soát tiền mặt

| Mã     | Quy tắc                                                                                                                                                                                                     | GĐ  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| BR-54  | Chỉ **tiền mặt** được đối soát. Chuyển khoản tính vào doanh thu nhưng không nằm trong két.                                                                                                                  | MVP |
| BR-55  | Tiền đầu ca do hệ thống điền, **thu ngân không sửa**. Ca thu ngân đầu tiên của chi nhánh lấy từ `branches.initial_cash` (do `OWNER` cài). Các ca sau lấy từ `counted_cash` của ca đã đóng trước đó (BR-89). | MVP |
| BR-89  | "Ca trước" là ca `CASHIER` đã `CLOSED` có `ended_at` gần nhất **trong cùng chi nhánh**.                                                                                                                     | MVP |
| BR-56  | Công thức đối soát xem mục 17. `cash_sales_amount` chỉ gồm thanh toán `CASH` của hóa đơn `PAID` thuộc ca. `expense_amount` chỉ gồm chi từ két.                                                              | MVP |
| BR-57  | Trạng thái: `difference = 0` là `MATCHED`, `< 0` là `SHORTAGE`, `> 0` là `OVERAGE`.                                                                                                                         | MVP |
| BR-58  | **Đếm mù**: khi đóng ca, thu ngân nhập `counted_cash` trước, hệ thống mới trả `expected_cash` và `difference`. Không gửi tiền kỳ vọng xuống giao diện trước khi nhập.                                       | MVP |
| BR-59  | `counted_cash` là tổng tiền thực đếm trong két (gồm cả tiền đầu ca), không phải riêng tiền bán.                                                                                                             | MVP |
| BR-60  | Ca lệch (`difference ≠ 0`) vẫn cho đóng nhưng bắt buộc ghi `note`, và được đánh dấu để quản lý xem lại.                                                                                                     | MVP |
| BR-61  | Các cột snapshot (`cash_sales_amount`, `expense_amount`, `expected_cash`) lưu lúc đóng ca và không đổi nữa.                                                                                                 | MVP |
| BR-102 | Nếu thu ngân thấy két thực tế khác tiền đầu ca hiển thị, báo lệch giao ca cho quản lý xử lý. Không tự sửa `opening_cash`.                                                                                   | MVP |

## 9. Hóa đơn

| Mã    | Quy tắc                                                                                                                                                                                                                                   | GĐ                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| BR-21 | Vòng đời: `OPEN` → `PAID` hoặc `CANCELLED`. `PAID` và `CANCELLED` là trạng thái cuối, không quay lại `OPEN`.                                                                                                                              | MVP                   |
| BR-22 | Chỉ thêm, sửa, xóa món khi hóa đơn còn `OPEN`.                                                                                                                                                                                            | MVP                   |
| BR-23 | `quantity` của món và topping phải lớn hơn 0.                                                                                                                                                                                             | MVP                   |
| BR-24 | **Giá luôn do hệ thống tính** từ `product_sizes.price` và `toppings.price`. Không có API nào nhận đơn giá hay tổng tiền từ client.                                                                                                        | MVP                   |
| BR-25 | Tiền tính theo công thức cố định (mục 17).                                                                                                                                                                                                | MVP                   |
| BR-26 | Khi thêm món, lưu snapshot tên món, tên size, đơn giá, tên và giá topping.                                                                                                                                                                | MVP                   |
| BR-27 | Hóa đơn phải có ít nhất một món mới được thanh toán.                                                                                                                                                                                      | MVP                   |
| BR-28 | Hủy đơn `OPEN`: thu ngân được hủy, bắt buộc ghi `cancel_reason`.                                                                                                                                                                          | MVP                   |
| BR-29 | Hủy đơn `PAID`: cần quyền quản lý, bắt buộc có lý do, và chỉ khi **ca của đơn đó còn mở**. Đơn của ca đã đóng chưa cho hủy ở MVP.                                                                                                         | MVP (ca đã đóng: GĐ2) |
| BR-69 | `invoices.branch_id` phải bằng `work_shifts.branch_id` của ca và bằng `dining_tables.branch_id` của bàn (nếu có). Lệch thì từ chối. Đơn `DINE_IN` phải có bàn, `TAKEAWAY` thì không.                                                      | MVP                   |
| BR-75 | Mã hóa đơn gồm mã chi nhánh, ví dụ `NL-20261027-0001`. Mã duy nhất trong chi nhánh.                                                                                                                                                       | MVP                   |
| BR-90 | Thêm món luôn **tạo dòng `invoice_items` mới**, không gộp dòng giống nhau. Sau mỗi thay đổi, tính lại `subtotal` bằng `SUM` từ các dòng món, trong transaction và khóa dòng hóa đơn (`SELECT ... FOR UPDATE`). Không cộng dồn từ tổng cũ. | MVP                   |

## 10. Thanh toán

| Mã    | Quy tắc                                                                                                                                                    | GĐ                      |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| BR-30 | Chỉ hai phương thức: `CASH` và `TRANSFER`.                                                                                                                 | MVP                     |
| BR-31 | Mỗi hóa đơn chỉ dùng một phương thức thanh toán. Hóa đơn thành `PAID` khi `Σ payments.amount = invoices.total_amount`. Không cho thanh toán vượt tổng tiền. | MVP                     |
| BR-32 | `CASH`: `tendered_amount ≥ amount`, `change_amount = tendered_amount − amount`. Tiền vào két và dùng để đối soát là `amount`, **không phải** số khách đưa. | MVP                     |
| BR-33 | `TRANSFER`: thu ngân xác nhận đã nhận tiền, ghi `transaction_ref` nếu có. Tự xác nhận qua webhook ngân hàng là phần mở rộng.                               | MVP (webhook: tùy chọn) |
| BR-34 | Mỗi yêu cầu thanh toán có `idempotency_key`. Gửi lại cùng key thì trả kết quả cũ, không tạo thanh toán thứ hai.                                            | MVP                     |
| BR-35 | Ghi `payments`, đổi `status` sang `PAID` và trừ kho nằm trong **một transaction**. Lỗi giữa chừng thì rollback toàn bộ.                                    | MVP                     |

## 11. Khuyến mãi

| Mã    | Quy tắc                                                                                                                                                                                          | GĐ                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| BR-36 | Mã chỉ áp được khi: `is_active`, `now()` trong `[start_at, end_at]`, `subtotal ≥ min_order_amount`, `used_count < usage_limit` (nếu có giới hạn). Mã thuộc cửa hàng, chỉ dùng trong cửa hàng đó. | MVP                 |
| BR-37 | Công thức giảm giá xem mục 17.                                                                                                                                                                   | MVP                 |
| BR-38 | Tiền giảm không vượt `subtotal`, nên `total_amount` không âm.                                                                                                                                    | MVP                 |
| BR-39 | `used_count` tăng khi hóa đơn dùng mã thành `PAID`. Đơn `PAID` bị hủy thì trả lại một lượt.                                                                                                      | MVP                 |
| BR-40 | Một hóa đơn không áp cùng một mã hai lần. Nếu chốt chỉ một mã mỗi hóa đơn thì chặn áp mã thứ hai.                                                                                                | MVP                 |
| BR-41 | Thu ngân không tự nhập số tiền giảm tùy ý. Giảm giá chỉ qua mã khuyến mãi hợp lệ. Giảm tay ngoài quy định cần quản lý duyệt.                                                                     | MVP (giảm tay: GĐ2) |

## 12. Kho và công thức

| Mã    | Quy tắc                                                                                                                                                                                                     | GĐ                           |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| BR-42 | Kho chỉ trừ khi hóa đơn thành `PAID`, không trừ lúc thêm món.                                                                                                                                               | MVP                          |
| BR-43 | Lượng trừ mỗi nguyên liệu tính theo công thức mục 17, gộp theo nguyên liệu, mỗi nguyên liệu ghi một dòng `SALE`.                                                                                            | MVP                          |
| BR-44 | Mọi thay đổi tồn kho đều ghi `stock_movements`. Sổ kho **chỉ thêm, không sửa, không xóa**. Sai thì thêm dòng điều chỉnh.                                                                                    | MVP                          |
| BR-45 | `branch_ingredient_stocks.current_stock` luôn bằng `Σ stock_movements.quantity` của cặp chi nhánh và nguyên liệu. Cập nhật bằng `UPDATE ... SET current_stock = current_stock + :delta`, không đọc rồi ghi. | MVP                          |
| BR-46 | Cho phép bán khi kho âm nhưng cảnh báo. Nguyên liệu có `current_stock ≤ min_stock` hiện trong danh sách sắp hết.                                                                                            | MVP (danh sách sắp hết: GĐ2) |
| BR-47 | Hủy đơn `PAID` thì thêm dòng `SALE_REVERSAL` cộng trả kho, không xóa dòng `SALE` cũ.                                                                                                                        | MVP                          |
| BR-48 | Mọi công thức và sổ kho dùng đúng `ingredients.unit`. Không trộn đơn vị.                                                                                                                                    | MVP                          |
| BR-49 | Món chưa có công thức vẫn bán được nhưng không trừ kho. Hệ thống cảnh báo để quản lý bổ sung công thức.                                                                                                     | MVP                          |
| BR-50 | Nhập hàng (`IMPORT`), hao hụt (`WASTE`), kiểm kê (`ADJUST`) chỉ quản lý trở lên được làm.                                                                                                                   | GĐ2                          |
| BR-72 | Trừ kho theo `invoices.branch_id`: cập nhật `branch_ingredient_stocks` của đúng chi nhánh và ghi `stock_movements` kèm `branch_id`. Công thức dùng chung trong cửa hàng, tồn kho tách theo chi nhánh.       | MVP                          |

## 13. Báo cáo

| Mã    | Quy tắc                                                                                                | GĐ  |
| ----- | ------------------------------------------------------------------------------------------------------ | --- |
| BR-62 | Doanh thu chỉ tính hóa đơn `PAID`, không tính `OPEN` hoặc `CANCELLED`.                                 | MVP |
| BR-63 | Doanh thu theo ngày gom theo `paid_at` ở **múi giờ Việt Nam (UTC+7)**, không gom theo UTC.             | MVP |
| BR-64 | Báo cáo luôn tách tiền mặt và chuyển khoản. Tổng doanh thu = tiền mặt + chuyển khoản.                  | MVP |
| BR-65 | `CASHIER` chỉ xem báo cáo ca của chính mình. `MANAGER` xem chi nhánh mình. `OWNER` xem toàn cửa hàng.  | MVP |
| BR-66 | Lợi nhuận gộp, món bán chạy, giờ cao điểm, báo cáo tuần và tháng.                                      | GĐ2 |
| BR-77 | Báo cáo có hai mức: theo từng chi nhánh, và tổng hợp toàn cửa hàng (chỉ người có `branch.access_all`). | MVP |

## 14. Nhật ký thao tác

| Mã    | Quy tắc                                                                                                                                                        | GĐ                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| BR-67 | Ghi lại ai, lúc nào, làm gì cho các thao tác nhạy cảm: hủy đơn, sửa giá, đóng cưỡng chế ca, chỉnh kho, đổi vai trò.                                            | GĐ2                |
| BR-68 | Báo cáo bất thường: thu ngân hủy đơn nhiều, ca lệch nhiều lần liên tiếp.                                                                                       | GĐ2                |
| BR-86 | Tạo cửa hàng, cấp tài khoản chủ, khóa hoặc mở cửa hàng, đặt lại mật khẩu phải ghi nhật ký. MVP có thể ghi log đơn giản, đầy đủ với `audit_logs` ở giai đoạn 2. | MVP (log đơn giản) |

---

## 15. Ma trận quyền (mặc định)

Cấu hình thật nằm ở `role_permissions`. Bảng này là mặc định khi khởi tạo dữ liệu.

| Chức năng                                           | `PLATFORM_ADMIN` | `OWNER`       | `MANAGER`           | `CASHIER`          |
| --------------------------------------------------- | ---------------- | ------------- | ------------------- | ------------------ |
| Tạo, khóa, mở lại cửa hàng                          | Có               | Không         | Không               | Không              |
| Cấp tài khoản `OWNER`                               | Có               | Không         | Không               | Không              |
| Chỉnh quyền dùng chung của các vai trò               | Có               | Không         | Không               | Không              |
| Quản lý chi nhánh, tài khoản `MANAGER` và `CASHIER` | Không            | Có            | Không               | Không              |
| Quản lý bàn                                         | Không            | Có            | Có (chi nhánh mình) | Không              |
| Quản lý menu, giá, topping, công thức, mã giảm giá  | Không            | Có            | Có                  | Không              |
| Mở và đóng ca của mình                              | Không            | Có            | Có                  | Có                 |
| Bán hàng, thêm món, thanh toán                      | Không            | Có            | Có                  | Có                 |
| Hủy đơn chưa thanh toán                             | Không            | Có            | Có                  | Có                 |
| Hủy đơn đã thanh toán                               | Không            | Có            | Có                  | Không              |
| Đóng cưỡng chế ca                                   | Không            | Có            | Có                  | Không              |
| Nhập kho, kiểm kê, ghi hao hụt (GĐ2)                | Không            | Có            | Có                  | Không              |
| Xem báo cáo                                         | Không            | Toàn cửa hàng | Chi nhánh mình      | Ca của mình        |
| Xem dữ liệu vận hành của cửa hàng                   | **Không**        | Có            | Có (chi nhánh mình) | Có (phần của mình) |

Quyền `branch.access_all` chỉ gán cho `OWNER`.

## 16. Vòng đời trạng thái

```
Hóa đơn:   OPEN ── thanh toán đủ ──▶ PAID
             │                         │
             └── hủy ──▶ CANCELLED ◀───┘   (PAID chỉ hủy được khi ca còn mở, cần quản lý)

Ca làm:    OPEN ── đóng ca ──▶ CLOSED       (không mở lại)

Đối soát:  PENDING ── đóng ca ──▶ MATCHED | SHORTAGE | OVERAGE

Cửa hàng:  ACTIVE ◀──▶ SUSPENDED
```

## 17. Công thức tham chiếu

Đầy đủ kèm điều kiện xem `DESIGN_DB_POS_SYSTEM.md`. Đây là bản rút gọn để đối chiếu khi viết test.

```
# Hóa đơn (BR-25)
invoice_items.line_total          = unit_price × quantity + Σ invoice_item_toppings.line_total
invoice_item_toppings.line_total  = unit_price × quantity × invoice_items.quantity
invoices.subtotal                 = Σ invoice_items.line_total
invoices.discount_amount          = Σ invoice_promotion_codes.discount_amount
invoices.total_amount             = MAX(subtotal − discount_amount, 0)

# Giảm giá (BR-37)
PERCENT: giảm = MIN(subtotal × discount_value / 100, max_discount_amount)
FIXED:   giảm = MIN(discount_value, subtotal)

# Tiền thối (BR-32)
change_amount = tendered_amount − amount          (CASH, yêu cầu tendered_amount ≥ amount)

# Đối soát (BR-56, BR-57)
cash_sales_amount = Σ payments.amount WHERE method = 'CASH' AND invoices.status = 'PAID' AND ca = <ca>
expense_amount    = Σ shift_expenses.amount WHERE ca = <ca> AND paid_from_drawer = true
expected_cash     = opening_cash + cash_sales_amount − expense_amount
difference        = counted_cash − expected_cash

# Tiền đầu ca (BR-55, BR-89)
có ca CASHIER CLOSED trước trong chi nhánh → opening_cash = counted_cash của ca gần nhất
ngược lại                                  → opening_cash = branches.initial_cash

# Trừ kho khi PAID (BR-43, BR-72)
dùng_từ_món     = product_size_ingredients.quantity × invoice_items.quantity
dùng_từ_topping = topping_ingredients.quantity × invoice_item_toppings.quantity × invoice_items.quantity
tổng_trừ        = Σ dùng_từ_món + Σ dùng_từ_topping   (gộp theo ingredient_id, theo chi nhánh của đơn)
```

## Ràng buộc cơ sở dữ liệu liên quan đến rule

| Rule  | Ràng buộc                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| BR-14 | `UNIQUE (user_id) WHERE status = 'OPEN'` trên `work_shifts`                                                                   |
| BR-87 | `UNIQUE (branch_id) WHERE status = 'OPEN' AND shift_type = 'CASHIER'` trên `work_shifts`                                      |
| BR-74 | `UNIQUE (table_id) WHERE status = 'OPEN' AND table_id IS NOT NULL` trên `invoices`                                            |
| BR-75 | `UNIQUE (branch_id, invoice_code)` trên `invoices`                                                                            |
| BR-34 | `UNIQUE (idempotency_key)` trên `payments`                                                                                    |
| BR-97 | `UNIQUE (username)` trên `users`                                                                                              |
| BR-13 | `UNIQUE (store_id, name)` trên `categories`, `sizes`, `toppings`, `ingredients`; `UNIQUE (category_id, name)` trên `products` |

Các rule BR-70, BR-79, BR-80, BR-83, BR-85 không chặn được bằng database, phải kiểm tra ở tầng ứng dụng.
