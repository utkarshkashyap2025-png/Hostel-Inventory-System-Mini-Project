import React, { useState } from 'react';
import { useAppState } from '../AppContext';
import { CampusTreeIcon } from './CampusTreeIcon';
import { 
  Sparkles, 
  LogIn, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase, 
  HelpCircle, 
  Info,
  Key,
  ArrowLeft,
  UserPlus,
  Mail,
  Phone
} from 'lucide-react';

export function LoginPage() {
  const { loginUser, students, addStudent, hostelName } = useAppState();
  
  // App views: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Selected tab role: 'Head' | 'Staff' | 'Student'
  const [role, setRole] = useState<'Head' | 'Staff' | 'Student'>('Head');
  
  // --- LOGIN STATES ---
  const [headEmail, setHeadEmail] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // --- REGISTER STATES ---
  const [regHeadName, setRegHeadName] = useState('');
  const [regHeadEmail, setRegHeadEmail] = useState('');
  const [regHeadPassword, setRegHeadPassword] = useState('');
  
  const [regStaffName, setRegStaffName] = useState('');
  const [regStaffEmail, setRegStaffEmail] = useState('');
  const [regStaffPassword, setRegStaffPassword] = useState('');
  
  const [regStudentRoll, setRegStudentRoll] = useState(() => {
    return `STU2026${String(students.length + 1).padStart(2, '0')}`;
  });
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentEmail, setRegStudentEmail] = useState('');
  const [regStudentPhone, setRegStudentPhone] = useState('');
  const [regStudentGender, setRegStudentGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // --- FORGOT PASS STATES ---
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRoll, setForgotRoll] = useState('');
  const [forgotName, setForgotName] = useState('');
  
  // Multi-step password reset states
  const [recoveredAccount, setRecoveredAccount] = useState<{
    role: 'Head' | 'Staff' | 'Student';
    email?: string;
    studentId?: string;
    name: string;
    indexInCollection?: number;
  } | null>(null);
  const [newPassInput, setNewPassInput] = useState('');

  // --- PERSISTED Sandbox Accounts ---
  const [registeredHeads, setRegisteredHeads] = useState<Array<{name: string, email: string, password: string}>>(() => {
    const saved = localStorage.getItem('hostel_registered_heads');
    return saved ? JSON.parse(saved) : [];
  });

  const [registeredStaff, setRegisteredStaff] = useState<Array<{name: string, email: string, password: string}>>(() => {
    const saved = localStorage.getItem('hostel_registered_staff');
    return saved ? JSON.parse(saved) : [];
  });

  // Quick credentials shortcut
  const handleQuickCredential = (roleType: 'Head' | 'Staff' | 'Student', customRoll?: string) => {
    setRole(roleType);
    setErrorStatus(null);
    setSuccessStatus(null);
    if (roleType === 'Head') {
      const activeHead = registeredHeads[0];
      if (activeHead) {
        setHeadEmail(activeHead.email);
        setHeadPassword(activeHead.password);
      } else {
        setHeadEmail('');
        setHeadPassword('');
      }
    } else if (roleType === 'Staff') {
      const activeStaff = registeredStaff[0];
      if (activeStaff) {
        setStaffEmail(activeStaff.email);
        setStaffPassword(activeStaff.password);
      } else {
        setStaffEmail('');
        setStaffPassword('');
      }
    } else if (roleType === 'Student') {
      const targetRoll = customRoll || (students[0]?.studentId || '');
      setStudentRoll(targetRoll);
      const studentMatch = students.find(s => s.studentId === targetRoll);
      if (studentMatch) {
         setStudentName(studentMatch.name);
      } else {
         setStudentName('');
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (role === 'Head') {
      if (!headEmail.trim()) {
        setErrorStatus('Please provide an administrator email address.');
        return;
      }
      const match = registeredHeads.find(h => h.email.toLowerCase() === headEmail.trim().toLowerCase());
      if (!match) {
        setErrorStatus('Administrator account not found in registry database. Register first or try a default sandbox account.');
        return;
      }
      if (match.password !== headPassword) {
        setErrorStatus('Incorrect security password for this administrator.');
        return;
      }
      loginUser(match.name, match.email, 'Head');
    } else if (role === 'Staff') {
      if (!staffEmail.trim()) {
        setErrorStatus('Please provide a staff caretaker email address.');
        return;
      }
      const match = registeredStaff.find(s => s.email.toLowerCase() === staffEmail.trim().toLowerCase());
      if (!match) {
        setErrorStatus('Staff caretaker email not found in database. Register first or try a default sandbox account.');
        return;
      }
      if (match.password !== staffPassword) {
        setErrorStatus('Incorrect staff security code.');
        return;
      }
      loginUser(match.name, match.email, 'Staff');
    } else {
      const rollInput = studentRoll.trim().toUpperCase();
      if (!rollInput) {
        setErrorStatus('Please enter your unique Student Roll Number (e.g. STU202609).');
        return;
      }

      const studentMatch = students.find(
        (s) => s.studentId.toUpperCase() === rollInput || s.name.toLowerCase() === studentName.trim().toLowerCase()
      );

      if (studentMatch) {
        loginUser(studentMatch.name, studentMatch.email, 'Student', studentMatch.studentId);
      } else {
        if (!studentName.trim()) {
          setErrorStatus(`Student roll code "${rollInput}" was not located. Type your student name to spawn a validation session.`);
          return;
        }
        loginUser(studentName.trim(), `${studentName.trim().toLowerCase().replace(/\s+/g, '')}@university.edu`, 'Student', rollInput);
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (role === 'Head') {
      if (!regHeadName.trim() || !regHeadEmail.trim() || !regHeadPassword.trim()) {
        setErrorStatus('Please fill in all layout fields to create an administrator profile.');
        return;
      }
      if (regHeadPassword.length < 4) {
        setErrorStatus('Administrator password must consist of 4 or more characters.');
        return;
      }
      
      const exists = registeredHeads.some(h => h.email.toLowerCase() === regHeadEmail.trim().toLowerCase());
      if (exists) {
        setErrorStatus('Email address is already linked with an administrator account.');
        return;
      }

      const updated = [...registeredHeads, {
        name: regHeadName.trim(),
        email: regHeadEmail.trim(),
        password: regHeadPassword
      }];
      setRegisteredHeads(updated);
      localStorage.setItem('hostel_registered_heads', JSON.stringify(updated));
      
      setHeadEmail(regHeadEmail.trim());
      setHeadPassword(regHeadPassword);
      
      setSuccessStatus(`Success! Created Administrator profile for ${regHeadName}. Preloaded details.`);
      setRegHeadName('');
      setRegHeadEmail('');
      setRegHeadPassword('');
      setMode('login');
      
    } else if (role === 'Staff') {
      if (!regStaffName.trim() || !regStaffEmail.trim() || !regStaffPassword.trim()) {
        setErrorStatus('Please fill in check-in staff details to proceed.');
        return;
      }
      if (regStaffPassword.length < 4) {
        setErrorStatus('Staff passwords must consist of at least 4 characters.');
        return;
      }
      
      const exists = registeredStaff.some(s => s.email.toLowerCase() === regStaffEmail.trim().toLowerCase());
      if (exists) {
        setErrorStatus('Email address is already linked with an active caretaker staff account.');
        return;
      }

      const updated = [...registeredStaff, {
        name: regStaffName.trim(),
        email: regStaffEmail.trim(),
        password: regStaffPassword
      }];
      setRegisteredStaff(updated);
      localStorage.setItem('hostel_registered_staff', JSON.stringify(updated));
      
      setStaffEmail(regStaffEmail.trim());
      setStaffPassword(regStaffPassword);
      
      setSuccessStatus(`Success! Created Caretaker Staff profile for ${regStaffName}. Preloaded details.`);
      setRegStaffName('');
      setRegStaffEmail('');
      setRegStaffPassword('');
      setMode('login');
      
    } else {
      // Student register
      if (!regStudentName.trim() || !regStudentEmail.trim() || !regStudentPhone.trim()) {
        setErrorStatus('Please provide student roster inputs (name, email & phone).');
        return;
      }
      
      const rollInput = regStudentRoll.trim().toUpperCase();
      const duplicateId = students.find(s => s.studentId.toUpperCase() === rollInput);
      if (duplicateId) {
        setErrorStatus(`A resident student with roll sequence code "${rollInput}" already exists.`);
        return;
      }

      addStudent({
        studentId: rollInput,
        name: regStudentName.trim(),
        email: regStudentEmail.trim().toLowerCase(),
        contact: regStudentPhone.trim(),
        gender: regStudentGender,
        roomNumber: null,
        block: null,
        joinDate: new Date().toISOString().split('T')[0]
      });

      // Populate input roll so login is preloaded
      setStudentRoll(rollInput);
      setStudentName(regStudentName.trim());
      
      setSuccessStatus(`Student roster registration created for "${regStudentName}"! Sign in using Roll ID: ${rollInput}.`);
      setRegStudentName('');
      setRegStudentEmail('');
      setRegStudentPhone('');
      // calculate next Roll code dynamically
      setRegStudentRoll(`STU2026${String(students.length + 2).padStart(2, '0')}`);
      setMode('login');
    }
  };

  const handleForgotSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (role === 'Head') {
      const idx = registeredHeads.findIndex(h => h.email.toLowerCase() === forgotEmail.trim().toLowerCase());
      if (idx === -1) {
        setErrorStatus('We could not find an Administrator account matching this email address.');
        return;
      }
      setRecoveredAccount({
        role: 'Head',
        email: registeredHeads[idx].email,
        name: registeredHeads[idx].name,
        indexInCollection: idx
      });
      setNewPassInput('');
    } else if (role === 'Staff') {
      const idx = registeredStaff.findIndex(s => s.email.toLowerCase() === forgotEmail.trim().toLowerCase());
      if (idx === -1) {
        setErrorStatus('We could not find a Staff Caretaker account matching this email address.');
        return;
      }
      setRecoveredAccount({
        role: 'Staff',
        email: registeredStaff[idx].email,
        name: registeredStaff[idx].name,
        indexInCollection: idx
      });
      setNewPassInput('');
    } else {
      // Student recovery
      const studentMatch = students.find(
        (s) => s.studentId.toUpperCase() === forgotRoll.trim().toUpperCase() || s.name.toLowerCase() === forgotName.trim().toLowerCase()
      );
      if (!studentMatch) {
         setErrorStatus(`Resident search returned empty. Check roll code or full name and try again.`);
         return;
      }
      setRecoveredAccount({
        role: 'Student',
        studentId: studentMatch.studentId,
        email: studentMatch.email,
        name: studentMatch.name
      });
    }
  };

  const handlePasswordResetConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveredAccount) return;
    setErrorStatus(null);
    setSuccessStatus(null);

    if (recoveredAccount.role === 'Head' && recoveredAccount.indexInCollection !== undefined) {
      if (newPassInput.length < 4) {
        setErrorStatus('New administrator security code must compose at least 4 characters.');
        return;
      }
      const updated = [...registeredHeads];
      updated[recoveredAccount.indexInCollection].password = newPassInput;
      setRegisteredHeads(updated);
      localStorage.setItem('hostel_registered_heads', JSON.stringify(updated));
      
      setHeadEmail(recoveredAccount.email || '');
      setHeadPassword(newPassInput);
      setSuccessStatus(`Password modified successfully for administrator "${recoveredAccount.name}". Preloaded!`);
      
      setRecoveredAccount(null);
      setForgotEmail('');
      setMode('login');
    } else if (recoveredAccount.role === 'Staff' && recoveredAccount.indexInCollection !== undefined) {
      if (newPassInput.length < 4) {
        setErrorStatus('New staff security token must compose at least 4 characters.');
        return;
      }
      const updated = [...registeredStaff];
      updated[recoveredAccount.indexInCollection].password = newPassInput;
      setRegisteredStaff(updated);
      localStorage.setItem('hostel_registered_staff', JSON.stringify(updated));
      
      setStaffEmail(recoveredAccount.email || '');
      setStaffPassword(newPassInput);
      setSuccessStatus(`Caretaker security code modified successfully for "${recoveredAccount.name}". Preloaded!`);
      
      setRecoveredAccount(null);
      setForgotEmail('');
      setMode('login');
    }
  };

  return (
    <div id="login-container-root" className="flex min-h-screen items-center justify-center bg-warm-white font-sans p-6 relative overflow-hidden">
      
      {/* Structural Subtle Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9B07A_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      
      {/* Pure elegance background shadow-circles */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gold-light/10 blur-3xl -z-1" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-ceramic/20 blur-3xl -z-1" />

      <div className="w-full max-w-md z-10 space-y-8">
        
        {/* Aesthetic Campus Brand Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white border border-ivory shadow-xs text-[#567A5E]">
            <CampusTreeIcon className="h-8 w-8 text-[#567A5E]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-serif text-charcoal tracking-tight select-none">
              {hostelName}
            </h1>
            <p className="font-mono text-[10px] tracking-widest text-[#6E7D91] uppercase font-bold">
              Hostel Governance Suite &bull; Digital Portal
            </p>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="rounded-2xl border border-ivory bg-white p-7 shadow-xs relative">
          
          {/* Header depending on layout mode */}
          <div className="mb-4 text-center">
            <h2 className="text-base font-serif text-charcoal font-bold">
              {mode === 'login' && 'Sign In to Workspace'}
              {mode === 'register' && 'Register Roster Account'}
              {mode === 'forgot' && 'Reset Security Credentials'}
            </h2>
            <p className="text-[10.5px] text-blue-gray-medium/85 mt-0.5">
              {mode === 'login' && 'Select your role tab below to enter the portal'}
              {mode === 'register' && 'Setup registered credentials to access features'}
              {mode === 'forgot' && 'Self-service sandboxed diagnostic credentials lookup'}
            </p>
          </div>

          {/* Custom Multi-Tab Segmented Selector (Role filter) */}
          <div className="bg-warm-white p-1 rounded-xl flex items-center mb-5.5 border border-ivory">
            <button
              type="button"
              disabled={recoveredAccount !== null}
              onClick={() => { setRole('Head'); setErrorStatus(null); setSuccessStatus(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 ${
                role === 'Head'
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-blue-gray-medium hover:text-charcoal'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Head</span>
            </button>
            
            <button
              type="button"
              disabled={recoveredAccount !== null}
              onClick={() => { setRole('Staff'); setErrorStatus(null); setSuccessStatus(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 ${
                role === 'Staff'
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-blue-gray-medium hover:text-charcoal'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Staff</span>
            </button>
            
            <button
              type="button"
              disabled={recoveredAccount !== null}
              onClick={() => { setRole('Student'); setErrorStatus(null); setSuccessStatus(null); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 ${
                role === 'Student'
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'text-blue-gray-medium hover:text-charcoal'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Student</span>
            </button>
          </div>

          {/* Error Message banner */}
          {errorStatus && (
            <div className="mb-4 rounded-xl bg-gold-light/20 border border-gold-accent/30 p-3.5 flex items-start gap-2.5 text-xs text-charcoal leading-relaxed animate-fade-in">
              <Info className="h-4 w-4 shrink-0 text-gold-accent mt-0.5" />
              <span>{errorStatus}</span>
            </div>
          )}

          {/* Success Message banner */}
          {successStatus && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs text-emerald-800 leading-relaxed animate-fade-in">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successStatus}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {role === 'Head' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Superintendent Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={headEmail}
                        onChange={(e) => setHeadEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. administrator@hostel.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Security Passcode
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={headPassword}
                        onChange={(e) => setHeadPassword(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-10 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-blue-gray-medium hover:text-charcoal cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {role === 'Staff' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Staff Caretaker Email
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. caretaker@hostel.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Staff Identity Token
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-10 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-blue-gray-medium hover:text-charcoal cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {role === 'Student' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Student Roll ID
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="text"
                        value={studentRoll}
                        onChange={(e) => {
                          setStudentRoll(e.target.value);
                          const matched = students.find(s => s.studentId.toUpperCase() === e.target.value.toUpperCase().trim());
                          if (matched) {
                            setStudentName(matched.name);
                          }
                        }}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. STU202609"
                      />
                    </div>
                    <span className="block mt-1 font-mono text-[9px] text-[#6E7D91]">
                      Tip: input your registered Roll ID to login.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Resident Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. Noah Wilson"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                id="submit-login-btn"
                type="submit"
                className="mt-3 w-full cursor-pointer rounded-lg bg-charcoal px-4 py-3 text-xs font-bold text-white tracking-wide transition hover:bg-black active:scale-99 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <LogIn className="h-4 w-4 text-gold-accent" />
                <span>Enter Workspace Portal</span>
              </button>

              {/* Sub actions navigation */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-ivory/50 mt-1.5 text-blue-gray-medium">
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setErrorStatus(null); setSuccessStatus(null); setRecoveredAccount(null); }}
                  className="hover:text-charcoal transition font-medium cursor-pointer"
                >
                  Forgot passcode?
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setMode('register'); 
                    setErrorStatus(null); 
                    setSuccessStatus(null); 
                    setRegStudentRoll(`STU2026${String(students.length + 1).padStart(2, '0')}`);
                  }}
                  className="text-[#567A5E] hover:text-[#436149] font-bold transition flex items-center gap-0.5 cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {role === 'Head' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Superintendent Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="text"
                        value={regHeadName}
                        onChange={(e) => setRegHeadName(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. Jane superintendent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Warden Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={regHeadEmail}
                        onChange={(e) => setRegHeadEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. warden@hostel.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Choose Passcode (4+ chars)
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="password"
                        value={regHeadPassword}
                        onChange={(e) => setRegHeadPassword(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="Set strong passcode"
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'Staff' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Caretaker Staff Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="text"
                        value={regStaffName}
                        onChange={(e) => setRegStaffName(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. Robert caretaker"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Staff Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={regStaffEmail}
                        onChange={(e) => setRegStaffEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. service@hostel.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Account security key
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="password"
                        value={regStaffPassword}
                        onChange={(e) => setRegStaffPassword(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2.5 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="Set security passcode"
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'Student' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                        Suggest Roll ID
                      </label>
                      <input
                        required
                        type="text"
                        value={regStudentRoll}
                        onChange={(e) => setRegStudentRoll(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-zinc-50 py-2 px-3 text-xs text-charcoal/90 font-mono focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="STU2026XX"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                        Roster Gender
                      </label>
                      <select
                        value={regStudentGender}
                        onChange={(e) => setRegStudentGender(e.target.value as 'Male' | 'Female' | 'Other')}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2 px-2.5 text-xs text-charcoal focus:border-gold-accent/80 focus:outline-hidden"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Student Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="text"
                        value={regStudentName}
                        onChange={(e) => setRegStudentName(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. Charles Darwin"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Roster Email Contact
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="email"
                        value={regStudentEmail}
                        onChange={(e) => setRegStudentEmail(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. student@university.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                      Emergency phone contact
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-gray-medium/60" />
                      <input
                        required
                        type="text"
                        value={regStudentPhone}
                        onChange={(e) => setRegStudentPhone(e.target.value)}
                        className="w-full rounded-lg border border-ivory bg-warm-white/45 py-2 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                        placeholder="e.g. +1 (555) 012-3456"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="mt-2 w-full cursor-pointer rounded-lg bg-charcoal px-4 py-2.5 text-xs font-bold text-white tracking-wide transition hover:bg-black active:scale-99 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="h-4 w-4 text-gold-accent" />
                <span>Confirm Registry Account</span>
              </button>

              <div className="pt-1.5 text-center border-t border-ivory/50 mt-1">
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setErrorStatus(null); setSuccessStatus(null); }}
                  className="font-semibold text-xs text-blue-gray-medium hover:text-charcoal inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to login gate</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!recoveredAccount ? (
                <form onSubmit={handleForgotSearch} className="space-y-4">
                  {role !== 'Student' ? (
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                        Register Account Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                        <input
                          required
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                          placeholder="e.g. associated@aspireresidency.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                          Student Roll ID
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                          <input
                            type="text"
                            value={forgotRoll}
                            onChange={(e) => setForgotRoll(e.target.value)}
                            className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                            placeholder="e.g. STU202609"
                          />
                        </div>
                      </div>

                      <div className="relative text-center font-mono text-[9px] text-blue-gray-medium/60 uppercase">
                        &mdash; OR BY NAME &mdash;
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                          Student Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                          <input
                            type="text"
                            value={forgotName}
                            onChange={(e) => setForgotName(e.target.value)}
                            className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                            placeholder="e.g. Noah Wilson"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg bg-charcoal px-4 py-3 text-xs font-bold text-white tracking-wide transition hover:bg-black active:scale-99 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Validate & Lookup Account</span>
                  </button>
                </form>
              ) : (
                // Reset password screen
                <div>
                  {recoveredAccount.role !== 'Student' ? (
                    <form onSubmit={handlePasswordResetConfirm} className="space-y-4">
                      <div className="bg-zinc-50 border border-ivory p-3.5 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-charcoal block">Account Located</span>
                        <p className="text-blue-gray-medium font-mono text-[11px]">
                          Role: {recoveredAccount.role} Warden &bull; {recoveredAccount.name}
                        </p>
                        <p className="text-blue-gray-medium font-mono text-[11px] truncate">
                          Mail: {recoveredAccount.email}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-wider text-blue-gray-medium uppercase mb-1">
                          Set New Security Passcode (4+ chars)
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-blue-gray-medium/60" />
                          <input
                            required
                            type="password"
                            value={newPassInput}
                            onChange={(e) => setNewPassInput(e.target.value)}
                            className="w-full rounded-lg border border-ivory bg-warm-white/45 py-3 pl-10 pr-4 text-xs text-charcoal placeholder-blue-gray-medium/50 focus:border-gold-accent/80 focus:outline-hidden"
                            placeholder="Enter new security passcode"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full cursor-pointer rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-3 text-xs font-bold text-white tracking-wide transition active:scale-99 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Update Security Key</span>
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-zinc-50 rounded-xl border border-ivory p-4 space-y-2 text-xs">
                        <p className="font-bold text-charcoal flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4 text-[#567A5E]" />
                          Verified Student Record Found
                        </p>
                        <div className="grid grid-cols-2 gap-y-1.5 font-mono text-[11px] pt-1 border-t border-ivory/50">
                          <span className="text-blue-gray-medium">Student Name:</span>
                          <span className="text-charcoal font-bold">{recoveredAccount.name}</span>
                          <span className="text-blue-gray-medium">Roll ID Code:</span>
                          <span className="text-[#567A5E] font-bold select-all bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{recoveredAccount.studentId}</span>
                          <span className="text-blue-gray-medium">Email Contact:</span>
                          <span className="text-charcoal truncate">{recoveredAccount.email}</span>
                        </div>
                      </div>
                      <div className="text-[11.5px] text-[#6E7D91] leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-100 italic">
                        <strong>Sandbox Bypass:</strong> Students in this portal login securely using their verified Roll ID Code & Name. Passwords are not mandatory. Enter either code in the login portal to run immediately.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (recoveredAccount.studentId) {
                            setStudentRoll(recoveredAccount.studentId);
                          }
                          setStudentName(recoveredAccount.name);
                          setRecoveredAccount(null);
                          setForgotEmail('');
                          setForgotRoll('');
                          setForgotName('');
                          setMode('login');
                          setSuccessStatus(`Preloaded sandbox credentials for ${recoveredAccount.name}.`);
                        }}
                        className="w-full rounded-lg bg-charcoal text-white py-2.5 text-xs font-bold hover:bg-black transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <LogIn className="h-3.5 w-3.5 text-gold-accent" />
                        <span>Preload Credentials & Sign In</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-1.5 text-center border-t border-ivory/50 mt-1">
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setErrorStatus(null); setSuccessStatus(null); setRecoveredAccount(null); }}
                  className="font-semibold text-xs text-blue-gray-medium hover:text-charcoal inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to login gate</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Demo Accounts quick setup */}
        <div className="rounded-2xl border border-ivory bg-white/40 p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-gray-medium">
            <HelpCircle className="h-3.5 w-3.5 text-gold-accent" />
            <span>Sandbox One-Click Credentials</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                if (registeredHeads.length === 0) {
                  setErrorStatus("No registered Warden Head accounts. Please register an Administrator account first.");
                } else {
                  handleQuickCredential('Head');
                }
              }}
              className={`p-2.5 rounded-xl text-[10px] text-left border flex flex-col justify-between h-15 transition cursor-pointer ${
                role === 'Head' ? 'border-gold-accent bg-gold-light/15 text-charcoal font-bold' : 'border-ivory bg-white/60 text-blue-gray-medium hover:bg-white'
              }`}
            >
              <span className="font-bold text-charcoal leading-tight">Warden Head</span>
              <span className="font-mono text-[8px] opacity-75">
                {registeredHeads[0]?.password || 'N/A'}
              </span>
            </button>
            <button
              onClick={() => {
                if (registeredStaff.length === 0) {
                  setErrorStatus("No registered Caretaker Staff accounts. Please register a Staff account first.");
                } else {
                  handleQuickCredential('Staff');
                }
              }}
              className={`p-2.5 rounded-xl text-[10px] text-left border flex flex-col justify-between h-15 transition cursor-pointer ${
                role === 'Staff' ? 'border-gold-accent bg-gold-light/15 text-charcoal font-bold' : 'border-ivory bg-white/60 text-blue-gray-medium hover:bg-white'
              }`}
            >
              <span className="font-bold text-charcoal leading-tight">Caretaker Staff</span>
              <span className="font-mono text-[8px] opacity-75">
                {registeredStaff[0]?.password || 'N/A'}
              </span>
            </button>
            <button
              onClick={() => {
                if (students.length === 0) {
                  setErrorStatus("No student records available. Students can be created in the Warden panel or logged in with any name and Roll-ID.");
                } else {
                  handleQuickCredential('Student', students[0]?.studentId);
                }
              }}
              className={`p-2.5 rounded-xl text-[10px] text-left border flex flex-col justify-between h-15 transition cursor-pointer ${
                role === 'Student' ? 'border-gold-accent bg-gold-light/15 text-charcoal font-bold' : 'border-ivory bg-white/60 text-blue-gray-medium hover:bg-white'
              }`}
            >
              <span className="font-bold text-charcoal leading-tight">Student Roster</span>
              <span className="font-mono text-[8px] truncate opacity-75">
                {students[0]?.studentId || 'N/A'}
              </span>
            </button>
          </div>

          <div className="rounded-lg bg-warm-white border border-ivory p-2.5 text-[10px] text-blue-gray-medium flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gold-accent shrink-0" />
            <span>Pre-populated configurations will appear here as you create records.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
