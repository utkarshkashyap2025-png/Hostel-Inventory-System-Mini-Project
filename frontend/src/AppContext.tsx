/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { Room, Student, InventoryItem, StockRecord, MaintenanceRequest, MessSupply, UserSession, Toast } from './types';
import {
  INITIAL_ROOMS,
  INITIAL_STUDENTS,
  INITIAL_INVENTORY,
  INITIAL_MAINTENANCE,
  INITIAL_MESS,
  INITIAL_STOCK_RECORDS,
} from './mockData';

interface AppContextType {
  rooms: Room[];
  students: Student[];
  inventory: InventoryItem[];
  stockRecords: StockRecord[];
  maintenance: MaintenanceRequest[];
  messSupplies: MessSupply[];
  hostelName: string;
  setHostelName: (name: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactPhone: string;
  setContactPhone: (phone: string) => void;
  systemLogs: Array<{ id: string; action: string; time: string; type: 'info' | 'warning' | 'success' }>;
  currentUser: UserSession | null;
  loginUser: (name: string, email: string, role: 'Head' | 'Staff' | 'Student', studentRollNumber?: string) => void;
  logoutUser: () => void;
  updateUserProfile: (name: string, phone?: string, password?: string, profilePic?: string) => void;
  
  // Theme Presets Selection
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  
  // Toast Notification System
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Actions
  addRoom: (room: Omit<Room, 'id' | 'occupied' | 'status'>) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  allocateRoomItem: (roomId: string, inventoryItemId: string, quantity: number) => void;
  removeRoomItem: (roomId: string, inventoryItemId: string) => void;
  
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  
  allotStudentRoom: (studentId: string, roomNumber: string) => boolean;
  unallotStudent: (studentId: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  adjustStock: (id: string, goodDiff: number, damagedDiff: number, repairDiff: number) => void;
  addStockRecord: (record: Omit<StockRecord, 'id'>) => void;
  deleteStockRecord: (id: string) => void;
  
  addMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'>) => void;
  updateMaintenanceStatus: (id: string, status: 'Pending' | 'In Progress' | 'Completed') => void;
  assignMaintenanceWorker: (id: string, worker: string | null) => void;
  deleteMaintenanceRequest: (id: string) => void;
  
  addMessSupply: (supply: Omit<MessSupply, 'id' | 'status' | 'lastStockDate'>) => void;
  updateMessQuantity: (id: string, newQty: number) => void;
  deleteMessSupply: (id: string) => void;
  addLog: (action: string, type?: 'info' | 'warning' | 'success') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure we clear out any stale local storage demo seeds from previous revisions
  if (typeof window !== 'undefined') {
    const CLEAN_KEY = 'hostel_cleaned_v6';
    if (!localStorage.getItem(CLEAN_KEY)) {
      localStorage.removeItem('hostel_rooms');
      localStorage.removeItem('hostel_students');
      localStorage.removeItem('hostel_inventory');
      localStorage.removeItem('hostel_stock_records');
      localStorage.removeItem('hostel_maintenance');
      localStorage.removeItem('hostel_mess');
      localStorage.removeItem('hostel_name');
      localStorage.removeItem('hostel_email');
      localStorage.removeItem('hostel_phone');
      localStorage.removeItem('hostel_current_user');
      localStorage.removeItem('hostel_registered_heads');
      localStorage.removeItem('hostel_registered_staff');
      localStorage.setItem(CLEAN_KEY, 'true');
    }
  }

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('hostel_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('hostel_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('hostel_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [stockRecords, setStockRecords] = useState<StockRecord[]>(() => {
    const saved = localStorage.getItem('hostel_stock_records');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_RECORDS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('hostel_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [messSupplies, setMessSupplies] = useState<MessSupply[]>(() => {
    const saved = localStorage.getItem('hostel_mess');
    return saved ? JSON.parse(saved) : INITIAL_MESS;
  });

  const [hostelName, setHostelNameState] = useState(() => {
    const saved = localStorage.getItem('hostel_name');
    return saved || 'Hostel Residency';
  });

  const [contactEmail, setContactEmailState] = useState(() => {
    const saved = localStorage.getItem('hostel_email');
    return saved || 'admin@hostel.edu';
  });

  const [contactPhone, setContactPhoneState] = useState(() => {
    return localStorage.getItem('hostel_phone') || '';
  });

  const setHostelName = (name: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setHostelNameState(name);
  };

  const setContactEmail = (email: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setContactEmailState(email);
  };

  const setContactPhone = (phone: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot change system properties.', 'error');
      return;
    }
    setContactPhoneState(phone);
  };

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('hostel_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedTheme, setSelectedThemeState] = useState<string>(() => {
    return localStorage.getItem('hostel_theme') || 'swiss';
  });

  const setSelectedTheme = (theme: string) => {
    setSelectedThemeState(theme);
    localStorage.setItem('hostel_theme', theme);
  };

  const [systemLogs, setSystemLogs] = useState<Array<{ id: string; action: string; time: string; type: 'info' | 'warning' | 'success' }>>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('hostel_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('hostel_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hostel_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('hostel_stock_records', JSON.stringify(stockRecords));
  }, [stockRecords]);

  useEffect(() => {
    localStorage.setItem('hostel_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('hostel_mess', JSON.stringify(messSupplies));
  }, [messSupplies]);

  useEffect(() => {
    localStorage.setItem('hostel_name', hostelName);
  }, [hostelName]);

  useEffect(() => {
    localStorage.setItem('hostel_email', contactEmail);
  }, [contactEmail]);

  useEffect(() => {
    localStorage.setItem('hostel_phone', contactPhone);
  }, [contactPhone]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hostel_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hostel_current_user');
    }
  }, [currentUser]);

  // Recalculate room occupancy counts automatically based on students allotment
  useEffect(() => {
    const updatedRooms = rooms.map((room) => {
      const occupantsCount = students.filter((s) => s.roomNumber === room.roomNumber).length;
      let status: 'Available' | 'Full' | 'Maintenance' = room.status;

      if (room.status !== 'Maintenance') {
        status = occupantsCount >= room.capacity ? 'Full' : 'Available';
      }

      if (room.occupied !== occupantsCount || room.status !== status) {
        return { ...room, occupied: occupantsCount, status };
      }
      return room;
    });

    // Solve React infinite render loop by checking if values are actually different
    const isDifferent = JSON.stringify(rooms) !== JSON.stringify(updatedRooms);
    if (isDifferent) {
      setRooms(updatedRooms);
    }
  }, [students]); // re-run only when students allotments change

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addLog = (action: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSystemLogs((prev) => [
      { id: `${Date.now()}`, action, time: `Today, ${timeStr}`, type },
      ...prev.slice(0, 19), // Cap logs at 20 items
    ]);
  };

  const loginUser = (name: string, email: string, role: 'Head' | 'Staff' | 'Student', studentRollNumber?: string) => {
    let phone = '';
    let profilePic = '';
    if (role === 'Staff') {
      const saved = localStorage.getItem('hostel_registered_staff');
      const list = saved ? JSON.parse(saved) : [];
      const match = list.find((s: any) => s.email.toLowerCase() === email.toLowerCase());
      if (match) {
        phone = match.phone || '';
        profilePic = match.avatar || '';
      }
    } else if (role === 'Head') {
      const saved = localStorage.getItem('hostel_registered_heads');
      const list = saved ? JSON.parse(saved) : [];
      const match = list.find((h: any) => h.email.toLowerCase() === email.toLowerCase());
      if (match) {
        phone = match.phone || '';
        profilePic = match.avatar || '';
      }
    } else if (role === 'Student') {
      const match = students.find((s) => s.studentId === studentRollNumber);
      if (match) {
        phone = match.contact;
      }
    }
    const session: UserSession = { name, email, role, studentRollNumber, phone, profilePic };
    setCurrentUser(session);
    addLog(`${name} has successfully logged in as ${role === 'Head' ? 'Head of Hostel' : role === 'Staff' ? 'Staff Member' : 'Student'}.`, 'success');
    showToast(`Welcome, ${name}! Signed in as ${role === 'Head' ? 'Hostel Head' : role === 'Staff' ? 'Staff Member' : 'Student'}.`, 'success');
  };

  const logoutUser = () => {
    if (currentUser) {
      addLog(`${currentUser.name} has logged out of the workspace.`, 'info');
      showToast('You have successfully logged out.', 'info');
    }
    setCurrentUser(null);
  };

  const updateUserProfile = (name: string, phone?: string, password?: string, profilePic?: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, name, phone: phone || currentUser.phone, profilePic: profilePic || currentUser.profilePic };
    setCurrentUser(updatedUser);
    localStorage.setItem('hostel_current_user', JSON.stringify(updatedUser));

    if (currentUser.role === 'Staff') {
      const saved = localStorage.getItem('hostel_registered_staff');
      const staffList = saved ? JSON.parse(saved) : [];
      const updatedList = staffList.map((s: any) => {
        if (s.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...s, name, password: password || s.password, phone, avatar: profilePic };
        }
        return s;
      });
      localStorage.setItem('hostel_registered_staff', JSON.stringify(updatedList));
    } else if (currentUser.role === 'Head') {
      const saved = localStorage.getItem('hostel_registered_heads');
      const headList = saved ? JSON.parse(saved) : [];
      const updatedList = headList.map((h: any) => {
        if (h.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...h, name, password: password || h.password, phone, avatar: profilePic };
        }
        return h;
      });
      localStorage.setItem('hostel_registered_heads', JSON.stringify(updatedList));
    }
    
    addLog(`User profile updated for ${name}`, 'success');
    showToast('Your profile has been saved successfully!', 'success');
  };

  // ROOM ACTIONS
  const addRoom = (roomData: Omit<Room, 'id' | 'occupied' | 'status'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot add rooms.', 'error');
      return;
    }
    const newRoom: Room = {
      ...roomData,
      id: `room_${Date.now()}`,
      occupied: 0,
      status: 'Available',
    };
    setRooms((prev) => [...prev, newRoom]);
    addLog(`Room "${newRoom.roomNumber}" was created in database.`, 'success');
    showToast(`Room ${newRoom.roomNumber} created successfully!`, 'success');
  };

  const updateRoom = (updatedRoom: Room) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify hostel details.', 'error');
      return;
    }
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    addLog(`Room info for "${updatedRoom.roomNumber}" was updated.`, 'info');
    showToast(`Room config for ${updatedRoom.roomNumber} updated successfully!`, 'success');
  };

  const deleteRoom = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete rooms.', 'error');
      return;
    }
    const target = rooms.find((r) => r.id === id);
    if (!target) return;
    
    // Unallot students first
    setStudents((prev) =>
      prev.map((s) => (s.roomNumber === target.roomNumber ? { ...s, roomNumber: null, block: null } : s))
    );
    setRooms((prev) => prev.filter((r) => r.id !== id));
    addLog(`Room "${target.roomNumber}" was deleted from the register.`, 'warning');
    showToast(`Room ${target.roomNumber} has been removed.`, 'info');
  };

  const allocateRoomItem = (roomId: string, inventoryItemId: string, quantity: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify room asset allocations.', 'error');
      return;
    }
    const targetRoom = rooms.find((r) => r.id === roomId);
    const targetItem = inventory.find((i) => i.id === inventoryItemId);
    if (!targetRoom || !targetItem) return;

    const allocated = targetRoom.allocatedItems || [];
    const existingIndex = allocated.findIndex((item) => item.inventoryItemId === inventoryItemId);

    let updatedAllocated = [...allocated];
    if (existingIndex > -1) {
      updatedAllocated[existingIndex] = {
        ...updatedAllocated[existingIndex],
        quantity: updatedAllocated[existingIndex].quantity + quantity
      };
    } else {
      updatedAllocated.push({
        inventoryItemId,
        inventoryItemName: targetItem.name,
        quantity,
        assignedDate: new Date().toISOString().split('T')[0]
      });
    }

    const updatedRoom: Room = {
      ...targetRoom,
      allocatedItems: updatedAllocated
    };

    setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)));
    addLog(`Allocated ${quantity}x "${targetItem.name}" to Room ${targetRoom.roomNumber}.`, 'success');
    showToast(`Allocated ${quantity}x ${targetItem.name} to Room ${targetRoom.roomNumber}`, 'success');
  };

  const removeRoomItem = (roomId: string, inventoryItemId: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot remove room assets.', 'error');
      return;
    }
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const allocated = targetRoom.allocatedItems || [];
    const itemToRemove = allocated.find((item) => item.inventoryItemId === inventoryItemId);
    if (!itemToRemove) return;

    const updatedAllocated = allocated.filter((item) => item.inventoryItemId !== inventoryItemId);

    const updatedRoom: Room = {
      ...targetRoom,
      allocatedItems: updatedAllocated
    };

    setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)));
    addLog(`Removed "${itemToRemove.inventoryItemName}" from Room ${targetRoom.roomNumber}.`, 'warning');
    showToast(`Removed asset from Room ${targetRoom.roomNumber}`, 'info');
  };

  // STUDENT ACTIONS
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot register students.', 'error');
      return;
    }
    const newStudent: Student = {
      ...studentData,
      id: `student_${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    addLog(`Student record created for ${newStudent.name}.`, 'success');
    showToast(`Student record for ${newStudent.name} created successfully!`, 'success');

    // If a room is allotted, adjust rooms (triggers room update logic)
    if (newStudent.roomNumber) {
      addLog(`Allotted Room ${newStudent.roomNumber} to ${newStudent.name}.`, 'success');
      showToast(`Allotted Room ${newStudent.roomNumber} to ${newStudent.name}.`, 'success');
    }
  };

  const updateStudent = (updatedStudent: Student) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify student records.', 'error');
      return;
    }
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    addLog(`Student record for "${updatedStudent.name}" was modified.`, 'info');
    showToast(`Student record for ${updatedStudent.name} modified successfully!`, 'success');
  };

  const deleteStudent = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete student records.', 'error');
      return;
    }
    const target = students.find((s) => s.id === id);
    if (!target) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    addLog(`Student record for "${target.name}" removed from the database.`, 'warning');
    showToast(`Student record for ${target.name} removed.`, 'info');
  };

  const allotStudentRoom = (studentId: string, roomNumber: string): boolean => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage room allotments.', 'error');
      return false;
    }
    const targetRoom = rooms.find((r) => r.roomNumber === roomNumber);
    if (!targetRoom) {
      showToast(`Error: Room ${roomNumber} not found.`, 'error');
      return false;
    }
    
    if (targetRoom.status === 'Maintenance') {
      addLog(`Cannot allot room ${roomNumber}: Room is under maintenance.`, 'warning');
      showToast(`Cannot allot room ${roomNumber}: Room is under maintenance.`, 'warning');
      return false;
    }
    
    const activeOccupants = students.filter((s) => s.roomNumber === roomNumber).length;
    if (activeOccupants >= targetRoom.capacity) {
      addLog(`Cannot allot room ${roomNumber}: Max capacity reached.`, 'warning');
      showToast(`Cannot allot room ${roomNumber}: Max capacity reached.`, 'warning');
      return false;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, roomNumber, block: targetRoom.block } : s
      )
    );
    const targetStudent = students.find((s) => s.id === studentId);
    addLog(`Successfully allotted Room ${roomNumber} to ${targetStudent?.name || 'student'}.`, 'success');
    showToast(`Student Allotment Successfully Created for ${targetStudent?.name || 'Student'} in Room ${roomNumber}!`, 'success');
    return true;
  };

  const unallotStudent = (studentId: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage room allotments.', 'error');
      return;
    }
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent || !targetStudent.roomNumber) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, roomNumber: null, block: null } : s))
    );
    addLog(`De-allocated Room ${targetStudent.roomNumber} from ${targetStudent.name}.`, 'warning');
    showToast(`De-allocated Room ${targetStudent.roomNumber} from ${targetStudent.name}.`, 'info');
  };

  // INVENTORY ACTIONS
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot manage inventory items.', 'error');
      return;
    }
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv_${Date.now()}`,
    };
    setInventory((prev) => [...prev, newItem]);
    addLog(`Added brand new inventory asset: "${newItem.name}".`, 'success');
    showToast(`Inventory asset "${newItem.name}" added successfully.`, 'success');
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify inventory items.', 'error');
      return;
    }
    setInventory((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    addLog(`Inventory record adjusted for "${updatedItem.name}".`, 'info');
    showToast(`Inventory item "${updatedItem.name}" updated successfully.`, 'success');
  };

  const deleteInventoryItem = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete inventory items.', 'error');
      return;
    }
    const target = inventory.find((i) => i.id === id);
    if (!target) return;
    setInventory((prev) => prev.filter((i) => i.id !== id));
    addLog(`Removed assets group: "${target.name}" from logistics system.`, 'warning');
    showToast(`Removed logistics assets group: "${target.name}"`, 'info');
  };

  const addStockRecord = (recordData: Omit<StockRecord, 'id'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot log stock shipments.', 'error');
      return;
    }
    const newRecord: StockRecord = {
      ...recordData,
      id: `sr_${Date.now()}`
    };
    setStockRecords((prev) => [newRecord, ...prev]);

    // Check if type is Incoming and auto-increment goodCount & quantity in inventory
    if (newRecord.type === 'Incoming') {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === newRecord.inventoryItemId || item.name === newRecord.inventoryItemName) {
            const addedQty = newRecord.quantity;
            const newGood = item.goodCount + addedQty;
            const newTotal = item.quantity + addedQty;
            return {
              ...item,
              goodCount: newGood,
              quantity: newTotal,
            };
          }
          return item;
        })
      );
      addLog(`Received incoming stock of ${newRecord.quantity} unts for "${newRecord.inventoryItemName}". Cost: $${newRecord.purchaseCost || 0}.`, 'success');
      showToast(`Incoming shipment of ${newRecord.quantity}x ${newRecord.inventoryItemName} received!`, 'success');
    } else {
      addLog(`Recorded stock event for "${newRecord.inventoryItemName}" (${newRecord.type}).`, 'info');
      showToast(`Recorded stock event successfully.`, 'success');
    }
  };

  const deleteStockRecord = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete stock logs.', 'error');
      return;
    }
    const target = stockRecords.find((r) => r.id === id);
    if (!target) return;
    setStockRecords((prev) => prev.filter((r) => r.id !== id));
    addLog(`Deleted stock log record from ${target.date} for "${target.inventoryItemName}".`, 'warning');
    showToast(`Stock record has been deleted.`, 'info');
  };

  const adjustStock = (id: string, goodDiff: number, damagedDiff: number, repairDiff: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot adjust stock levels.', 'error');
      return;
    }
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newGood = Math.max(0, item.goodCount + goodDiff);
          const newDamaged = Math.max(0, item.damagedCount + damagedDiff);
          const newRepair = Math.max(0, item.repairCount + repairDiff);
          const newTotal = newGood + newDamaged + newRepair;
          return {
            ...item,
            goodCount: newGood,
            damagedCount: newDamaged,
            repairCount: newRepair,
            quantity: newTotal,
          };
        }
        return item;
      })
    );
    const item = inventory.find((i) => i.id === id);
    addLog(`Inventory stock levels adjusted for "${item?.name}".`, 'info');
  };

  // MAINTENANCE ACTIONS
  const addMaintenanceRequest = (item: Omit<MaintenanceRequest, 'id' | 'date' | 'status' | 'assignedTo'>) => {
    const newReq: MaintenanceRequest = {
      ...item,
      id: `req_${Date.now()}`,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      assignedTo: null,
    };
    setMaintenance((prev) => [newReq, ...prev]);
    addLog(`Raised a ${newReq.priority} priority maintenance ticket for ${newReq.roomNumber}: "${newReq.title}"`, 'warning');
    showToast(`Work Order Successfully Raised: "${newReq.title}"`, 'success');
  };

  const updateMaintenanceStatus = (id: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    const req = maintenance.find((m) => m.id === id);
    if (req) {
      addLog(`Maintenance issue "${req.title}" status changed to ${status.toUpperCase()}.`, status === 'Completed' ? 'success' : 'info');
      showToast(`Work Order Updated to ${status}!`, 'success');
    }
  };

  const assignMaintenanceWorker = (id: string, worker: string | null) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot assign specialists.', 'error');
      return;
    }
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, assignedTo: worker, status: worker ? 'In Progress' : 'Pending' } : m))
    );
    const req = maintenance.find((m) => m.id === id);
    addLog(`Assigned ${worker || 'nobody'} to maintenance task "${req?.title}".`, 'info');
    showToast(`Assigned worker to work order: "${req?.title}"`, 'success');
  };

  const deleteMaintenanceRequest = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete maintenance requests.', 'error');
      return;
    }
    const target = maintenance.find((m) => m.id === id);
    if (!target) return;
    setMaintenance((prev) => prev.filter((m) => m.id !== id));
    addLog(`Deleted maintenance ticket #${id} (${target.title}).`, 'info');
    showToast(`Work order ticket for "${target.title}" deleted.`, 'info');
  };

  // MESS ACTIONS
  const addMessSupply = (supplyData: Omit<MessSupply, 'id' | 'status' | 'lastStockDate'>) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot add mess supply items.', 'error');
      return;
    }
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (supplyData.quantity === 0) status = 'Out of Stock';
    else if (supplyData.quantity <= supplyData.minRequired) status = 'Low Stock';

    const newSupply: MessSupply = {
      ...supplyData,
      id: `mess_${Date.now()}`,
      status,
      lastStockDate: new Date().toISOString().split('T')[0],
    };
    setMessSupplies((prev) => [...prev, newSupply]);
    addLog(`Stock added for Mess pantry item: "${newSupply.name}"`, 'success');
    showToast(`Added kitchen pantry item "${newSupply.name}".`, 'success');
  };

  const updateMessQuantity = (id: string, newQty: number) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot modify mess stock quantity.', 'error');
      return;
    }
    setMessSupplies((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (newQty <= 0) status = 'Out of Stock';
          else if (newQty <= m.minRequired) status = 'Low Stock';

          return {
            ...m,
            quantity: Math.max(0, newQty),
            status,
            lastStockDate: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      })
    );
    const item = messSupplies.find((m) => m.id === id);
    addLog(`Mess store inventory for "${item?.name}" set to ${newQty} unit(s).`, 'info');
    showToast(`Mess supply "${item?.name}" pantry stock updated to ${newQty}!`, 'success');
  };

  const deleteMessSupply = (id: string) => {
    if (currentUser?.role === 'Staff') {
      showToast('Action Denied: Staff cannot delete mess supply items.', 'error');
      return;
    }
    const target = messSupplies.find((m) => m.id === id);
    if (!target) return;
    setMessSupplies((prev) => prev.filter((m) => m.id !== id));
    addLog(`Removed pantry item "${target.name}" from mess records.`, 'warning');
    showToast(`Removed pantry item "${target.name}".`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        students,
        inventory,
        maintenance,
        messSupplies,
        hostelName,
        setHostelName,
        contactEmail,
        setContactEmail,
        contactPhone,
        setContactPhone,
        systemLogs,
        currentUser,
        loginUser,
        logoutUser,
        updateUserProfile,
        selectedTheme,
        setSelectedTheme,
        toasts,
        showToast,
        removeToast,
        addRoom,
        updateRoom,
        deleteRoom,
        allocateRoomItem,
        removeRoomItem,
        addStudent,
        updateStudent,
        deleteStudent,
        allotStudentRoom,
        unallotStudent,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,
        stockRecords,
        addStockRecord,
        deleteStockRecord,
        addMaintenanceRequest,
        updateMaintenanceStatus,
        assignMaintenanceWorker,
        deleteMaintenanceRequest,
        addMessSupply,
        updateMessQuantity,
        deleteMessSupply,
        addLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
