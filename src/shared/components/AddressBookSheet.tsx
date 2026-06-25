import { ATOM_USER_INFO, phoneNumberAtom } from "features/xacthuc/state/auth.state";
import React, { useState, useRef, useEffect } from "react";
import { Sheet, Box, Input, useSnackbar } from "zmp-ui";
import { useRecoilState, useRecoilValue } from "recoil";
import { savedAddressesState, AddressItem } from "features/nguoidung/state/address.state";
import locationData from "data/locations.json";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedAddressId?: string | null;
  onSelectAddress?: (id: string) => void;
  mode?: "pick" | "manage";
}

const getUserDisplayName = (value: unknown) => {
  if (!value || typeof value !== "object") return "";
  const record = value as { name?: unknown; userInfo?: { name?: unknown } };
  const name = record.userInfo?.name ?? record.name;
  return typeof name === "string" ? name : "";
};

const SwipeableItem: React.FC<{
  onDelete: () => void;
  children: React.ReactNode;
  enabled: boolean;
}> = ({ onDelete, children, enabled }) => {
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    touchStartX.current = e.touches[0].clientX;
    currentX.current = offsetX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    let newX = currentX.current + diff;
    if (newX > 0) newX = 0;
    if (newX < -70) newX = -70; 
    setOffsetX(newX);
  };

  const handleTouchEnd = () => {
    if (!enabled) return;
    if (offsetX < -35) {
      setOffsetX(-70);
    } else {
      setOffsetX(0);
    }
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      onDelete();
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}>
      {}
      {enabled && (
        <div 
          onClick={confirmDelete}
          style={{
            position: "absolute", top: 0, bottom: 0, right: 0, width: 70,
            background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", cursor: "pointer"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </div>
      )}

      {}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: "translateX($offsetXpx)",
          transition: offsetX === 0 || offsetX === -70 ? "transform 0.2s ease-out" : "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const AddressBookSheet: React.FC<Props> = ({ visible, onClose, selectedAddressId, onSelectAddress, mode = "pick" }) => {
  const { openSnackbar } = useSnackbar();
  const [savedAddresses, setSavedAddresses] = useRecoilState(savedAddressesState);
  const userInfo = useRecoilValue(ATOM_USER_INFO);
  const userPhone = useRecoilValue(phoneNumberAtom);
  
  const [isAddAddressSheetOpen, setIsAddAddressSheetOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [manageSelectedId, setManageSelectedId] = useState<string | null>(null);

  // Set initial selected id for manage mode
  useEffect(() => {
    if (mode === "manage" && visible && !manageSelectedId && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      setManageSelectedId(defaultAddr.id);
    }
  }, [mode, visible, savedAddresses, manageSelectedId]);

  useEffect(() => {
    document.body.classList.toggle("address-book-open", visible);
    return () => document.body.classList.remove("address-book-open");
  }, [visible]);

  const activeId = mode === "pick" ? selectedAddressId : manageSelectedId;

  // Form states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>("");
  const [selectedWardCode, setSelectedWardCode] = useState<string>("");
  const [newProvinceName, setNewProvinceName] = useState("");
  const [newWardName, setNewWardName] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);

    const handleAutoFillMe = () => {
    if (userInfo) setNewName(getUserDisplayName(userInfo));
    if (userPhone) setNewPhone(userPhone);
    openSnackbar({ text: "Đã tự động điền thông tin của bạn", type: "success" });
  };

  const resetForm = () => {
    setEditingAddressId(null);
    setNewName("");
    setNewPhone("");
    setSelectedProvinceCode("");
    setNewProvinceName("");
    setSelectedWardCode("");
    setNewWardName("");
    setNewStreet("");
    setNewIsDefault(false);
  };

  const handleEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setNewName(addr.name);
    setNewPhone(addr.phone);
    const parts = addr.fullAddress.split(", ");
    if (parts.length >= 3) {
      const streetPart = parts.slice(0, parts.length - 2).join(", ");
      const wardPart = parts[parts.length - 2];
      const provPart = parts[parts.length - 1];
      setNewStreet(streetPart);
      setNewWardName(wardPart);
      setNewProvinceName(provPart);
      
      const pCode = locationData.provinces.find(p => p.name === provPart)?.code || "";
      setSelectedProvinceCode(pCode);
      if (pCode) {
        const wards = (locationData.wards as any)[pCode] || [];
        const wCode = wards.find((w: any) => w.name === wardPart)?.code || "";
        setSelectedWardCode(wCode);
      }
    } else {
      setNewStreet(addr.fullAddress);
    }
    setNewIsDefault(addr.isDefault);
    setIsAddAddressSheetOpen(true);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const pName = locationData.provinces.find(p => p.code === code)?.name || "";
    setNewProvinceName(pName);
    setSelectedWardCode("");
    setNewWardName("");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedWardCode(code);
    const availableWards = (locationData.wards as any)[selectedProvinceCode] || [];
    const wName = availableWards.find((w: any) => w.code === code)?.name || "";
    setNewWardName(wName);
  };

  const handleSaveNewAddress = () => {
    if (!newName || !newPhone || !newProvinceName || !newWardName || !newStreet) {
      openSnackbar({ text: "Vui lòng nhập đầy đủ thông tin", type: "warning" });
      return;
    }

    const newAddr: AddressItem = {
      id: editingAddressId || ("addr_" + Date.now()),
      name: newName,
      phone: newPhone,
      fullAddress: `${newStreet}, ${newWardName}, ${newProvinceName}`,
      isDefault: newIsDefault || savedAddresses.length === 0
    };

    let newSaved = [...savedAddresses];
    if (editingAddressId) {
      newSaved = newSaved.map(a => a.id === editingAddressId ? newAddr : a);
    } else {
      newSaved.push(newAddr);
    }

    if (newAddr.isDefault) {
      newSaved = newSaved.map(a => ({ ...a, isDefault: a.id === newAddr.id }));
    }

    setSavedAddresses(newSaved);

    if (mode === "pick" && onSelectAddress && !editingAddressId) {
       onSelectAddress(newAddr.id);
    }
    if (mode === "manage" && !editingAddressId) {
       setManageSelectedId(newAddr.id);
    }

    setIsAddAddressSheetOpen(false);
    resetForm();
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(savedAddresses.filter(a => a.id !== id));
    if (manageSelectedId === id) {
      setManageSelectedId(null);
    }
  };

  const handleSetDefaultToggle = () => {
    if (activeId) {
      const addr = savedAddresses.find(a => a.id === activeId);
      if (addr) {
        const newValue = !addr.isDefault;
        if (newValue) {
          setSavedAddresses(savedAddresses.map(a => ({ ...a, isDefault: a.id === activeId })));
        }
      }
    }
  };

  return (
    <>
      <Sheet visible={visible && !isAddAddressSheetOpen} onClose={onClose} autoHeight className="address-book-sheet">
        <Box p={4} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
             <div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>
               {mode === "manage" ? "Địa chỉ" : "Chọn địa chỉ giao hàng"}
             </div>
             {mode === "manage" && <button onClick={onClose} style={{ border: "none", background: "transparent", color: "#4b5563", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Đóng</button>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedAddresses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 14 }}>
                Chưa có địa chỉ nào được lưu.
              </div>
            ) : (
              savedAddresses.map((addr) => {
                const isSelected = activeId === addr.id;
                
                return (
                  <SwipeableItem key={addr.id} onDelete={() => handleDeleteAddress(addr.id)} enabled={mode === "manage"}>
                    <div
                      onClick={() => {
                        if (mode === "pick" && onSelectAddress) {
                          onSelectAddress(addr.id);
                        } else if (mode === "manage") {
                          setManageSelectedId(addr.id);
                        }
                      }}
                      style={{
                        display: "flex", gap: 12, padding: "16px", borderRadius: 12, 
                        border: isSelected ? "2px solid #be185d" : "1px solid #e5e7eb",
                        background: isSelected ? "#fdf2f8" : "#fff", cursor: "pointer",
                        height: 96,
                        boxSizing: "border-box"
                      }}>
                      
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (mode === "pick" && onSelectAddress) onSelectAddress(addr.id);
                          if (mode === "manage") setManageSelectedId(addr.id);
                        }}
                        style={{ 
                          width: 22, height: 22, borderRadius: 6, 
                          background: isSelected ? "#be185d" : "#fff", 
                          border: isSelected ? "none" : "2px solid #d1d5db", 
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          alignSelf: "center"
                        }}>
                          {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>

                      <div style={{ flex: 1 }} onClick={() => mode === "manage" && handleEditAddress(addr)}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span>{addr.name}</span>
                            <span style={{ color: "#9ca3af", fontWeight: 400, margin: "0 8px" }}>|</span>
                            <span style={{ fontWeight: 500 }}>{addr.phone}</span>
                          </div>
                          {addr.isDefault && (
                            <div style={{ background: "#be185d", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                              Mặc định
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: 13, color: "#6b7280", lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                          {addr.fullAddress}
                        </div>
                      </div>
                    </div>
                  </SwipeableItem>
                );
              })
            )}
          </div>

          {mode === "manage" && (
            <button
              onClick={() => { resetForm(); setIsAddAddressSheetOpen(true); }}
              style={{ width: "100%", height: 48, background: "#fff", color: "#be185d", border: "1px solid #be185d", borderRadius: 14, fontSize: 15, fontWeight: 700, marginTop: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}
            >
              <span style={{ fontSize: 20, fontWeight: 400 }}>+</span> Thêm địa chỉ mới
            </button>
          )}
          
          {activeId && mode === "manage" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, padding: "12px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d" , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#4b5563" }}>Đặt làm địa chỉ mặc định</span>
              <div 
                onClick={handleSetDefaultToggle}
                style={{ width: 44, height: 24, borderRadius: 12, background: savedAddresses.find(a => a.id === activeId)?.isDefault ? "#be185d" : "#d1d5db", position: "relative", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: savedAddresses.find(a => a.id === activeId)?.isDefault ? 22 : 2, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          )}
        </Box>
      </Sheet>

      <Sheet visible={visible && isAddAddressSheetOpen} onClose={() => setIsAddAddressSheetOpen(false)} autoHeight className="address-book-sheet">
        <Box p={4} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={() => setIsAddAddressSheetOpen(false)} style={{ border: "none", background: "transparent", color: "#4b5563", display: "flex", alignItems: "center", cursor: "pointer" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#831843" }}>
              {editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d" , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <button onClick={handleAutoFillMe} style={{ alignSelf: "flex-end", border: "none", background: "transparent", color: "#be185d", fontSize: 12, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>Tự điền của tôi</button>
            <Input type="text" placeholder="Họ và tên người nhận" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 14, width: "100%" }} />
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d" , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <Input type="text" placeholder="Số điện thoại liên hệ" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 14, width: "100%" }} />
            </div>
            
            <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d", padding: "12px", position: "relative" , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <select value={selectedProvinceCode} onChange={handleProvinceChange as any} style={{ width: "100%", border: "none", background: "transparent", fontSize: 14, outline: "none", color: selectedProvinceCode ? "#1f2937" : "#6b7280", appearance: "none" }}>
                <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                {locationData.provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▼</div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d", padding: "12px", position: "relative", opacity: selectedProvinceCode ? 1 : 0.5 , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <select value={selectedWardCode} onChange={handleWardChange as any} disabled={!selectedProvinceCode} style={{ width: "100%", border: "none", background: "transparent", fontSize: 14, outline: "none", color: selectedWardCode ? "#1f2937" : "#6b7280", appearance: "none" }}>
                <option value="" disabled>Chọn Phường/Xã</option>
                {((locationData.wards as any)[selectedProvinceCode] || []).map((w: any) => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▼</div>
            </div>

            <div style={{ background: "#f9fafb", borderRadius: 12, border: "1px solid #be185d" , boxShadow: "0 6px 8px rgba(0, 0, 0, 0.14)"}}>
              <Input.TextArea placeholder="Tên đường, Toà nhà, Số nhà..." value={newStreet} onChange={(e) => setNewStreet(e.target.value)} style={{ border: "none", background: "transparent", fontSize: 14, width: "100%", resize: "none", minHeight: 60 }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
               <input type="checkbox" id="isDefaultSheet" checked={newIsDefault} onChange={(e) => setNewIsDefault(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#be185d" }} />
               <label htmlFor="isDefaultSheet" style={{ fontSize: 14, fontWeight: 700, color: "#4b5563", cursor: "pointer" }}>Đặt làm địa chỉ mặc định</label>
            </div>
          </div>

          <button onClick={handleSaveNewAddress} style={{ width: "100%", height: 48, background: "linear-gradient(135deg, #db2777 0%, #be185d 100%)", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, marginTop: 20, cursor: "pointer" }}>
            Lưu địa chỉ
          </button>
        </Box>
      </Sheet>
    </>
  );
};
