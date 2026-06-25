const fs = require('fs');

let path = 'src/features/datlich/pages/datlich.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add guestCount note
const targetSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>\r\n            </button>\r\n          </div>\r\n        </div>';
const replacementNote = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>\r\n            </button>\r\n          </div>\r\n          {guestCount > 1 && selectedServices.length > 0 && (\r\n            <div style={{ fontSize: 11, color: "#be185d", marginTop: 8, fontStyle: "italic", fontWeight: 600 }}>\r\n              * Lưu ý: Các khách hàng sẽ trải nghiệm tất cả dịch vụ đã chọn cùng lúc.\r\n            </div>\r\n          )}\r\n        </div>';

content = content.replace(targetSvg.replace(/\r/g, ''), replacementNote.replace(/\r/g, ''));

// 2. Remember checkout state
const targetHooks = `  const navigate = useNavigate();
  const setCheckout = useSetRecoilState(checkoutState);
  const { openSnackbar } = useSnackbar();      

  const [services, setServices] = useState<SpaService[]>([]);
  const [technicians, setTechnicians] = useState<SpaTechnician[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedKTV, setSelectedKTV] = useState<string | undefined>(undefined);
  const [busyTechnicianIds, setBusyTechnicianIds] = useState<string[]>([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeServiceFilter, setActiveServiceFilter] = useState("Tất cả");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [guestCount, setGuestCount] = useState(1);`;

const replacementHooks = `  const navigate = useNavigate();
  const checkout = useRecoilValue(checkoutState);
  const setCheckout = useSetRecoilState(checkoutState);
  const { openSnackbar } = useSnackbar();      

  const [services, setServices] = useState<SpaService[]>([]);
  const [technicians, setTechnicians] = useState<SpaTechnician[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const initialServices = checkout?.items?.length > 0 ? checkout.items.map(item => String(item.id)) : [];
  const initialKTV = checkout?.items?.length > 0 && checkout.items[0].technicianId ? String(checkout.items[0].technicianId) : undefined;
  const initialDate = checkout?.items?.length > 0 ? checkout.items[0].dateStr || "" : "";
  const initialTime = checkout?.items?.length > 0 ? checkout.items[0].time || "09:00" : "09:00";
  const initialGuestCount = checkout?.items?.length > 0 ? checkout.items[0].quantity || 1 : 1;

  const [selectedServices, setSelectedServices] = useState<string[]>(initialServices);
  const [selectedKTV, setSelectedKTV] = useState<string | undefined>(initialKTV);
  const [busyTechnicianIds, setBusyTechnicianIds] = useState<string[]>([]);
  const [busyTimeSlots, setBusyTimeSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [isServiceSheetOpen, setIsServiceSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeServiceFilter, setActiveServiceFilter] = useState("Tất cả");

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [guestCount, setGuestCount] = useState(initialGuestCount);`;

content = content.replace(targetHooks.replace(/\r/g, ''), replacementHooks.replace(/\r/g, ''));

const targetUseEffect = `    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    const firstValid = TIME_SLOTS.find(slot => {
      const [h, m] = slot.split(":").map(Number);
      return h > currentHours || (h === currentHours && m > currentMinutes);
    });
    if (firstValid) {
      setSelectedDate(\`\${yyyy}-\${mm}-\${dd}\`);
      setSelectedTime(firstValid);
    } else {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(\`\${tomorrow.getFullYear()}-\${String(tomorrow.getMonth() + 1).padStart(2, "0")}-\${String(tomorrow.getDate()).padStart(2, "0")}\`);
      setSelectedTime(TIME_SLOTS[0]);
    }`;

const replacementUseEffect = `    if (!initialDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const currentHours = today.getHours();
      const currentMinutes = today.getMinutes();
      const firstValid = TIME_SLOTS.find(slot => {
        const [h, m] = slot.split(":").map(Number);
        return h > currentHours || (h === currentHours && m > currentMinutes);
      });
      if (firstValid) {
        setSelectedDate(\`\${yyyy}-\${mm}-\${dd}\`);
        setSelectedTime(firstValid);
      } else {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(\`\${tomorrow.getFullYear()}-\${String(tomorrow.getMonth() + 1).padStart(2, "0")}-\${String(tomorrow.getDate()).padStart(2, "0")}\`);
        setSelectedTime(TIME_SLOTS[0]);
      }
    }`;

content = content.replace(targetUseEffect.replace(/\r/g, ''), replacementUseEffect.replace(/\r/g, ''));

fs.writeFileSync(path, content, 'utf8');
