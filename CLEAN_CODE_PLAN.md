# Kế hoạch clean code miniapp `spa`

File này là checklist làm việc. Khi hoàn tất phần nào thì tick phần đó, không tick trước.

## Nguyên tắc

- [ ] Không đổi UI khi mục tiêu chỉ là tách cấu trúc.
- [ ] Không đổi logic nghiệp vụ nếu không có yêu cầu rõ.
- [ ] Không move/rename hàng loạt trong cùng lượt với refactor logic.
- [ ] Mỗi lần chỉ clean một feature hoặc một nhóm file liên quan trực tiếp.
- [ ] Page chỉ nên điều phối và render, không ôm API mapping, format, auth parsing, polling phức tạp.
- [ ] Data từ BE phải được chuẩn hóa trong service/normalizer, page không tự đoán field.
- [ ] Type phải rõ ở boundary BE -> FE; hạn chế `any`, ưu tiên DTO/type/normalizer.
- [ ] Text tiếng Việt dùng UTF-8 trực tiếp, không dùng `\uXXXX` cho UI text.
- [ ] Giữ regex Unicode hợp lệ như `.replace(/[\u0300-\u036f]/g, "")`.
- [ ] Sau mỗi nhóm clean phải chạy `npm run check:utf8`.
- [ ] Sau mỗi nhóm clean phải chạy `npm run build`.
- [ ] Nếu build chỉ còn warning cũ từ Vite/Tailwind/Ant Design/chunk size thì ghi nhận, không xử lý lẫn với feature clean.

## Cấu trúc đích

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
    layout/
  shared/
    api/
    auth/
    components/
    constants/
    types/
    utils/
  features/
    home/
    booking/
    checkout/
    technician-schedule/
    profile/
    articles/
    services/
    vouchers/
```

## Trạng thái đã làm

- [x] Thêm script `npm run check:utf8`.
- [x] Clean UI text dạng `\uXXXX` ở `danhgia.tsx`, `khuyenmai.tsx`.
- [x] Thêm type nền: `SpaBooking`, `SpaArticle`, `SpaReview`, `SpaAmenity`, `SpaBanner`.
- [x] Thêm common UI nền: `PageHeader`, `DetailStickyHeader`, `SectionTitle`, `StatusPill`, `EmptyState`, `LoadingState`.
- [x] Sửa các lỗi type phát sinh sau khi siết type API.
- [x] Build pass sau nhóm clean nền.

## Giai đoạn 1: Chuẩn hóa nền

- [ ] Tạo `src/shared/api` và chuyển dần `config/api.ts`, `utils/httpclient.ts` vào đúng tầng.
- [ ] Tạo `src/shared/utils/format.ts` cho format tiền/ngày/giờ.
- [ ] Tạo `src/shared/utils/text.ts` cho normalize text, role, slug.
- [ ] Tạo `src/shared/utils/assets.ts` cho `buildAssetUrl`.
- [ ] Tạo `src/shared/auth/useCurrentUser.ts`.
- [ ] Tạo `src/shared/auth/useRequireAuth.ts`.
- [ ] Tạo `src/shared/auth/useIsTechnician.ts`.
- [ ] Gom các status label/color dùng chung vào `shared/constants/status.ts`.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 2: Clean thời khóa biểu KTV

Đây là feature làm mẫu đầu tiên.

- [ ] Tạo `src/features/technician-schedule`.
- [ ] Tạo `types/schedule.types.ts`.
- [ ] Tạo `utils/scheduleDate.ts`.
- [ ] Tạo `hooks/useTechnicianSchedule.ts`.
- [ ] Tách polling booking khỏi page.
- [ ] Tách logic notify booking mới khỏi page.
- [ ] Tạo `components/ScheduleWeekPicker.tsx`.
- [ ] Tạo `components/ScheduleBookingCard.tsx`.
- [ ] Tạo `components/ScheduleServiceRow.tsx` nếu cần.
- [ ] Move `pages/thoi-khoa-bieu.tsx` sang `features/technician-schedule/pages/TechnicianSchedulePage.tsx`.
- [ ] Cập nhật route import nhưng giữ nguyên path `/thoi-khoa-bieu`.
- [ ] Kiểm tra KTV vẫn thấy thời khóa biểu.
- [ ] Kiểm tra khách hàng không thấy thời khóa biểu.
- [ ] Kiểm tra chọn T2..CN không lỗi.
- [ ] Kiểm tra booking có duration hiển thị giờ kết thúc.
- [ ] Kiểm tra notification booking mới không ảnh hưởng flow khác.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 3: Clean checkout và voucher

- [ ] Tạo `src/features/checkout`.
- [ ] Tạo `checkout/types`.
- [ ] Tạo `checkout/hooks/useCheckout.ts`.
- [ ] Tách tính subtotal/discount/total khỏi `thanhtoan.tsx`.
- [ ] Tách validate voucher khỏi page.
- [ ] Tạo `checkout/components/CheckoutSummary.tsx`.
- [ ] Tạo `checkout/components/CheckoutCustomerInfo.tsx`.
- [ ] Tạo `src/features/vouchers`.
- [ ] Move `VoucherSheet.tsx` vào `features/vouchers/components/VoucherSheet.tsx`.
- [ ] Tạo `vouchers/utils/voucherFormat.ts`.
- [ ] Tạo `vouchers/components/VoucherCard.tsx`.
- [ ] Kiểm tra chọn ưu đãi trong thanh toán.
- [ ] Kiểm tra nhập mã voucher.
- [ ] Kiểm tra voucher hết hạn/hết lượt.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 4: Clean đặt lịch

- [ ] Tạo `src/features/booking`.
- [ ] Tạo `booking/types`.
- [ ] Tạo `booking/hooks/useBookingForm.ts`.
- [ ] Tách chọn chi nhánh.
- [ ] Tách chọn dịch vụ.
- [ ] Tách chọn ngày/giờ.
- [ ] Tách chọn kỹ thuật viên.
- [ ] Tách validation đặt lịch.
- [ ] Move `datlich.tsx` sang `features/booking/pages/BookingPage.tsx`.
- [ ] Move `QuickBookingSheet.tsx` sang `features/booking/components/QuickBookingSheet.tsx`.
- [ ] Kiểm tra flow đặt lịch thường.
- [ ] Kiểm tra quick booking từ card dịch vụ.
- [ ] Kiểm tra busy technician.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 5: Clean lịch sử đơn

- [ ] Tạo `src/features/booking-history`.
- [ ] Tạo `hooks/useBookingHistory.ts`.
- [ ] Tách cancel booking action.
- [ ] Tách feedback action.
- [ ] Tạo `components/BookingHistoryCard.tsx`.
- [ ] Tạo `components/BookingFeedbackSheet.tsx`.
- [ ] Dùng chung `StatusPill`.
- [ ] Move `lichsudon.tsx` sang feature mới.
- [ ] Kiểm tra hủy lịch.
- [ ] Kiểm tra gửi đánh giá.
- [ ] Kiểm tra hiển thị lịch sử.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 6: Clean profile và tài khoản

- [ ] Tạo `src/features/profile`.
- [ ] Tách config menu tài khoản/ưu đãi/hỗ trợ.
- [ ] Move `profile.tsx` sang `features/profile/pages/ProfilePage.tsx`.
- [ ] Move `thongtincanhan.tsx` sang `features/profile/pages/PersonalInfoPage.tsx`.
- [ ] Move `AddressBookSheet.tsx` sang `features/profile/components/AddressBookSheet.tsx`.
- [ ] Tách address form state thành hook.
- [ ] Tách location helpers.
- [ ] Kiểm tra menu khách hàng.
- [ ] Kiểm tra menu KTV có thời khóa biểu.
- [ ] Kiểm tra thêm/sửa/xóa địa chỉ.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 7: Clean home

- [ ] Tạo `src/features/home`.
- [ ] Move `pages/index/index.tsx` sang `features/home/pages/HomePage.tsx`.
- [ ] Move các component trong `pages/index/components` sang `features/home/components`.
- [ ] Tách `FeaturesGrid` thành data config + component render.
- [ ] Tách banner loading.
- [ ] Tách service groups/featured services card dùng chung với feature services.
- [ ] Kiểm tra trang chủ.
- [ ] Kiểm tra branch picker.
- [ ] Kiểm tra grid tiện ích theo role.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 8: Clean articles và detail pages

- [ ] Tạo `src/features/articles`.
- [ ] Tạo `components/ArticleCard.tsx`.
- [ ] Tạo `pages/ArticleListPage.tsx`.
- [ ] Tạo `pages/ArticleDetailPage.tsx`.
- [ ] Tạo `shared/components/RichContentRenderer.tsx`.
- [ ] Dùng `RichContentRenderer` cho detail tin tức.
- [ ] Dùng `RichContentRenderer` cho detail dịch vụ.
- [ ] Gom sticky detail header.
- [ ] Gom scroll-to-top button.
- [ ] Kiểm tra danh sách tin tức.
- [ ] Kiểm tra chi tiết tin tức.
- [ ] Kiểm tra title nổi trên banner.
- [ ] Kiểm tra header hiện khi cuộn.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 9: Clean services

- [ ] Tạo `src/features/services`.
- [ ] Tạo `components/ServiceCard.tsx`.
- [ ] Tạo `pages/ServiceListPage.tsx`.
- [ ] Tạo `pages/ServiceDetailPage.tsx`.
- [ ] Tách booking modal từ detail nếu còn nằm lẫn.
- [ ] Gom format service duration/price.
- [ ] Kiểm tra danh mục dịch vụ.
- [ ] Kiểm tra chi tiết dịch vụ hiển thị mô tả ngắn và mô tả liệu trình.
- [ ] Kiểm tra xuống dòng/gạch đầu dòng trong miniapp.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 10: Rename và chuẩn hóa import

Chỉ làm sau khi các feature chính đã ổn.

- [ ] `Comingsoonmodal.tsx` -> `ComingSoonModal.tsx`.
- [ ] `Loginpromptmodal.tsx` -> `LoginPromptModal.tsx`.
- [ ] `banner.tsx` -> `BannerSlider.tsx`.
- [ ] `navigation.tsx` -> `Navigation.tsx`.
- [ ] `config-provider.tsx` -> `ConfigProvider.tsx`.
- [ ] `xinquyen.tsx` -> `PermissionGate.tsx` hoặc tên phù hợp.
- [ ] Chuẩn hóa page component suffix `Page`.
- [ ] Chuẩn hóa service suffix `.service.ts` hoặc `.api.ts`, chọn một kiểu.
- [ ] Kiểm tra không còn import sai casing.
- [ ] Kiểm tra `npm run check:utf8`.
- [ ] Kiểm tra `npm run build`.

## Giai đoạn 11: Dọn cảnh báo build

- [ ] Cập nhật Tailwind `purge` sang `content`.
- [ ] Cân nhắc cập nhật Browserslist DB.
- [ ] Xem lại warning Vite CJS.
- [ ] Xem chiến lược tách chunk nếu cần.
- [ ] Đánh giá import Ant Design để giảm bundle nếu có thể.
- [ ] Kiểm tra `npm run build`.

## Tiêu chí hoàn tất một feature

- [ ] Page còn dưới mức dễ đọc, ưu tiên dưới khoảng 180-220 dòng nếu hợp lý.
- [ ] Page không chứa API mapping thô.
- [ ] Page không parse role/auth thủ công.
- [ ] Page không tự đoán quá nhiều field BE.
- [ ] Logic chính có hook hoặc util riêng.
- [ ] Component card/list/detail có file riêng.
- [ ] Không tăng lỗi UTF-8.
- [ ] Build pass.
- [ ] Luồng chính được test tay.
