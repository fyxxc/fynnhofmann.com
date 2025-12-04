import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, onSnapshot, updateDoc, addDoc, query, deleteDoc } from "firebase/firestore";
import { 
  LayoutDashboard, 
  Bus, 
  Bike, 
  Train, 
  AlertTriangle, 
  Users, 
  Activity, 
  Clock, 
  Search, 
  Bell, 
  TrainFront, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  X, 
  MessageSquare, 
  Lock 
} from 'lucide-react';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "DEIN_API_KEY_PLATZHALTER",
  authDomain: "dein-projekt.firebaseapp.com",
  projectId: "dein-projekt",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "000000000",
  appId: "1:00000000:web:abcdef"
};

let app: any, auth: any, db: any;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.warn("Firebase läuft im Demo-Modus (keine echte DB Verbindung).");
}

const appId = 'tfl-production-app'; 

// --- Real TfL Operational Units ---
const OPERATIONAL_UNITS = {
  Tube: ['Neasden Depot (Jubilee/Met)', 'Ruislip Depot (Central)', 'Cockfosters Depot (Picc)', 'Northumberland Park (Victoria)', 'Stratford Market Depot'],
  Bus: ['Walworth Garage (Go-Ahead)', 'West Ham Garage (Stagecoach)', 'Willesden Junction (Metroline)', 'Battersea Depot', 'Lea Interchange'],
  Elizabeth: ['Old Oak Common Depot', 'Maidenhead Sidings', 'Ilford Depot'],
  IT: ['TfL Tech Service Ops (TSO)', 'Network Command (Cyber)', 'Ticketing Support (Cubic)', 'Signal Engineering'],
  Bike: ['Santander Cycle Logistics (Pentonville)', 'Rapid Response Unit South']
};

// --- Types ---

interface AppUser {
  id: string;
  username: string;
  password?: string; 
  name: string;
  email: string;
  role: 'Admin' | 'Dispatcher' | 'Technician' | 'Viewer';
  department: string;
  hub: string;
}

interface IncidentLog {
  timestamp: string;
  author: string;
  message: string;
}

interface Incident {
  id: string;
  refId: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  system: 'Tube' | 'Bus' | 'Bike' | 'IT' | 'Elizabeth Line';
  assignedTeam: string;
  reportedBy: string;
  timestamp: string;
  logs?: IncidentLog[];
}

interface Staff {
  id: string;
  staffId: string;
  name: string;
  role: string;
  status: 'Active' | 'Break' | 'Off Duty';
  location: string;
}

// Static Data for Line Status
const SERVICE_STATUS = [
  { line: 'Bakerloo', status: 'Good Service', color: 'bg-[#B36305]' },
  { line: 'Central', status: 'Severe Delays', color: 'bg-[#E32017]' },
  { line: 'Circle', status: 'Good Service', color: 'bg-[#FFD300]' },
  { line: 'District', status: 'Minor Delays', color: 'bg-[#00782A]' },
  { line: 'Hammersmith', status: 'Good Service', color: 'bg-[#F3A9BB]' },
  { line: 'Jubilee', status: 'Good Service', color: 'bg-[#A0A5A9]' },
  { line: 'Metropolitan', status: 'Good Service', color: 'bg-[#9B0056]' },
  { line: 'Northern', status: 'Good Service', color: 'bg-[#000000]' },
  { line: 'Piccadilly', status: 'Good Service', color: 'bg-[#003688]' },
  { line: 'Victoria', status: 'Good Service', color: 'bg-[#0098D4]' },
];

// --- Components ---

const TfLRoundel = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <div className="absolute inset-0 rounded-full border-[6px] border-[#E32017] bg-white/10"></div>
    <div className="absolute w-[120%] h-[20%] bg-[#003688] z-10"></div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getColors = (s: string) => {
    switch(s) {
      case 'Good Service': case 'Resolved': case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Minor Delays': case 'In Progress': case 'Break': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Severe Delays': case 'Critical': case 'Suspended': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getColors(status)}`}>
      {status.toUpperCase()}
    </span>
  );
};

// --- Main Application ---

export default function TfLControl() {
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [incidents, setIncidents] = useState<Incident[]>([
      { id: '1', refId: 'INC-Demo-01', title: 'Signal Failure Baker St', description: 'Signal failure on southbound line.', priority: 'Critical', status: 'Open', system: 'Tube', assignedTeam: 'Neasden Depot', reportedBy: 'System', timestamp: new Date().toISOString() }
  ]);
  const [staffList, setStaffList] = useState<Staff[]>([
      { id: '1', staffId: 'S-101', name: 'John Doe', role: 'Driver', status: 'Active', location: 'Train 404' }
  ]);
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newLogMessage, setNewLogMessage] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<AppUser>>({});

  // --- Init ---
  useEffect(() => {
    if (!auth) return;
    const init = async () => {
       try { await signInAnonymously(auth); } catch(e) { console.log("Demo Mode"); }
    };
    init();
    const unsubscribe = onAuthStateChanged(auth, (user: any) => setFirebaseUser(user));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { unsubscribe(); clearInterval(timer); };
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    if (!firebaseUser || !db) return;
    try {
        const usersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'app_users'));
        // FIX: Wir entfernen 'err', da wir es nicht nutzen, um Warnungen zu vermeiden
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
            setUsersList(data);
        }, () => console.log("Demo Mode: Using local user list"));

        const incQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'));
        const unsubInc = onSnapshot(incQuery, (snapshot) => {
            setIncidents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Incident)));
        });

        const staffQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'staff'));
        const unsubStaff = onSnapshot(staffQuery, (snapshot) => {
            setStaffList(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
        });
        
        return () => { unsubUsers(); unsubInc(); unsubStaff(); };
    } catch(e) { console.log("Demo Mode Active"); }
  }, [firebaseUser]);

  // --- Actions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
        const realUser = usersList.find(u => u.username === 'admin' && u.password === 'admin123');
        if (realUser) {
             setAppUser(realUser);
        } else {
             setAppUser({
                id: 'demo', username: 'admin', name: 'System Admin (Local)', email: 'admin@tfl.gov', 
                role: 'Admin', department: 'Central Control', hub: 'Blackfriars'
            });
        }
        setLoginError('');
        return;
    }
    const user = usersList.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) { setAppUser(user); setLoginError(''); } else { setLoginError('Invalid credentials. Try admin / admin123'); }
  };

  const handleLogout = () => { setAppUser(null); setLoginUsername(''); setLoginPassword(''); };

  const saveUser = async () => {
    const userData: AppUser = {
      id: editingUser.id || Math.random().toString(),
      username: editingUser.username!,
      password: editingUser.password,
      name: editingUser.name || 'Unknown',
      email: editingUser.email || '',
      role: editingUser.role || 'Viewer',
      department: editingUser.department || 'General',
      hub: editingUser.hub || 'HQ'
    };
    if (db) {
        try {
            if (editingUser.id) {
              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_users', editingUser.id), userData as any);
            } else {
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'app_users'), userData);
            }
        } catch(e) { alert("Datenbank Fehler (Demo Mode)"); }
    } else {
        setUsersList(prev => editingUser.id ? prev.map(u => u.id === editingUser.id ? userData : u) : [...prev, userData]);
    }
    setIsUserModalOpen(false);
    setEditingUser({});
  };

  const deleteUser = async (id: string) => {
    if (confirm('Delete User?')) {
        if (db) {
            try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_users', id)); }
            catch(e) { alert("Datenbank Fehler"); }
        } else {
            setUsersList(prev => prev.filter(u => u.id !== id));
        }
    }
  };

  const updateIncident = async (id: string, data: Partial<Incident>) => {
    if (db) {
        try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id), data); }
        catch(e) {}
    } else {
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    }
  };

  const addIncidentLog = async () => {
    if (!selectedIncident || !newLogMessage) return;
    const newLog: IncidentLog = {
      timestamp: new Date().toISOString(),
      author: appUser?.name || 'Unknown',
      message: newLogMessage
    };
    const updatedLogs = [...(selectedIncident.logs || []), newLog];
    
    // Optimistic Update
    setSelectedIncident({...selectedIncident, logs: updatedLogs});
    
    // DB Update
    if (db) {
        await updateIncident(selectedIncident.id, { logs: updatedLogs });
    } else {
        updateIncident(selectedIncident.id, { logs: updatedLogs });
    }
    setNewLogMessage('');
  };

  // --- Sub-Render Functions (Now inside Component Scope) ---

  const renderIncidentModal = () => {
    if (!selectedIncident) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 rounded-t-xl">
             <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className="font-mono text-slate-500 text-sm">{selectedIncident.refId}</span>
                   <StatusBadge status={selectedIncident.priority} />
                   <StatusBadge status={selectedIncident.status} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedIncident.title}</h2>
             </div>
             <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-slate-200 rounded-full">
               <X className="w-6 h-6 text-slate-500" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="text-xs font-bold text-blue-800 uppercase">Incident Description</label>
                  <p className="text-slate-800 mt-1">{selectedIncident.description || 'No description provided.'}</p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Team</label>
                    <select 
                      value={selectedIncident.assignedTeam}
                      onChange={(e) => {
                         updateIncident(selectedIncident.id, { assignedTeam: e.target.value });
                         setSelectedIncident({...selectedIncident, assignedTeam: e.target.value});
                      }}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#113B92]"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <optgroup label="Underground">
                        {OPERATIONAL_UNITS.Tube.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                      <optgroup label="Bus & Tram">
                        {OPERATIONAL_UNITS.Bus.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                      <optgroup label="Elizabeth Line">
                        {OPERATIONAL_UNITS.Elizabeth.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                      <optgroup label="IT & Tech">
                        {OPERATIONAL_UNITS.IT.map(t => <option key={t} value={t}>{t}</option>)}
                      </optgroup>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select 
                      value={selectedIncident.status}
                      onChange={(e) => {
                         const newStatus = e.target.value as any;
                         updateIncident(selectedIncident.id, { status: newStatus });
                         setSelectedIncident({...selectedIncident, status: newStatus});
                      }}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#113B92]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Operational Logs</label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 overflow-y-auto space-y-4 mb-4">
                    {selectedIncident.logs?.map((log, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-[#113B92] rounded-full flex items-center justify-center text-xs font-bold">
                          {log.author.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-slate-700">{log.author}</span>
                             <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                           </div>
                           <p className="text-sm text-slate-600 mt-0.5">{log.message}</p>
                        </div>
                      </div>
                    ))}
                    {!selectedIncident.logs?.length && <div className="text-center text-slate-400 text-sm mt-10">No logs yet. Start the thread below.</div>}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newLogMessage}
                      onChange={(e) => setNewLogMessage(e.target.value)}
                      placeholder="Add an operational note..."
                      className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-[#113B92] outline-none"
                    />
                    <button onClick={addIncidentLog} className="bg-[#113B92] text-white px-4 rounded font-bold hover:bg-blue-800">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                 </div>
               </div>
            </div>

            <div className="border-l border-slate-100 pl-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reported By</h4>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{selectedIncident.reportedBy || 'System Automated'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System</h4>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{selectedIncident.system}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time Reported</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{selectedIncident.timestamp}</span>
                  </div>
                </div>
                
                <div className="pt-8 mt-auto">
                   <button 
                     onClick={() => {
                       updateIncident(selectedIncident.id, { status: 'Resolved' });
                       setSelectedIncident({...selectedIncident, status: 'Resolved'});
                     }}
                     className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2"
                   >
                     <CheckCircle className="w-5 h-5" />
                     Resolve Case
                   </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold text-[#113B92]">User Administration</h2>
            <p className="text-slate-500">Manage access control and staff roles.</p>
         </div>
         <button 
           onClick={() => { setEditingUser({}); setIsUserModalOpen(true); }}
           className="bg-[#113B92] text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 shadow-md"
         >
           <Plus className="w-5 h-5" /> Add User
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
             <tr>
               <th className="p-4">Staff Name</th>
               <th className="p-4">Username</th>
               <th className="p-4">Department</th>
               <th className="p-4">Role</th>
               <th className="p-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {usersList.map(u => (
               <tr key={u.id} className="hover:bg-slate-50 group">
                 <td className="p-4 font-bold text-slate-700">{u.name}</td>
                 <td className="p-4 font-mono text-slate-500">{u.username}</td>
                 <td className="p-4">
                   <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{u.department}</span>
                 </td>
                 <td className="p-4 text-slate-600">{u.role}</td>
                 <td className="p-4 text-right flex justify-end gap-2 opacity-60 group-hover:opacity-100">
                   <button 
                    onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                   >
                     <Edit3 className="w-4 h-4" />
                   </button>
                   {u.username !== 'admin' && (
                     <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 hover:bg-red-100 rounded text-red-600"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                 </td>
               </tr>
             ))}
             {usersList.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Keine DB Verbindung. Zeige nur lokalen Admin.</td></tr>
             )}
           </tbody>
         </table>
      </div>

      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
                {editingUser.id ? 'Edit User' : 'Create New User'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Username</label>
                    <input 
                      className="w-full p-2 border rounded mt-1" 
                      value={editingUser.username || ''}
                      onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                    <input 
                      className="w-full p-2 border rounded mt-1" 
                      type="text"
                      placeholder="Set password"
                      value={editingUser.password || ''}
                      onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Full Name</label>
                    <input 
                      className="w-full p-2 border rounded mt-1" 
                      value={editingUser.name || ''}
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Email</label>
                    <input 
                      className="w-full p-2 border rounded mt-1" 
                      value={editingUser.email || ''}
                      onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Department</label>
                    <input 
                      className="w-full p-2 border rounded mt-1" 
                      placeholder="e.g. Tube Ops"
                      value={editingUser.department || ''}
                      onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500">Role</label>
                    <select 
                      className="w-full p-2 border rounded mt-1"
                      value={editingUser.role || 'Viewer'}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                    >
                      <option>Admin</option>
                      <option>Dispatcher</option>
                      <option>Technician</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                 <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                 <button onClick={saveUser} className="px-6 py-2 bg-[#113B92] text-white font-bold rounded hover:bg-blue-800">Save User</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Active Incidents</h3>
              <AlertTriangle className="w-5 h-5 text-red-500" />
           </div>
           <span className="text-3xl font-bold text-slate-800">{incidents.filter(i => i.status !== 'Resolved').length}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Staff on Duty</h3>
              <Users className="w-5 h-5 text-blue-500" />
           </div>
           <span className="text-3xl font-bold text-slate-800">{staffList.filter(s => s.status === 'Active').length}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">System Health</h3>
              <Activity className="w-5 h-5 text-emerald-500" />
           </div>
           <span className="text-3xl font-bold text-slate-800">98.4%</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
           <div className="flex justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase">Current Shift</h3>
              <Clock className="w-5 h-5 text-orange-500" />
           </div>
           <span className="text-3xl font-bold text-slate-800">Early (A)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-[#113B92] flex items-center gap-2">
              <TrainFront className="w-5 h-5" /> Underground Network
            </h2>
            <div className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200">LIVE FEED</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
            {SERVICE_STATUS.map((service) => (
              <div key={service.line} className="flex items-center justify-between p-3 bg-white rounded border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                  <span className={`font-bold text-sm text-slate-800`}>{service.line}</span>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
          <h2 className="font-bold text-[#113B92] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> Operational Alerts
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3">
             {incidents.filter(i => i.status !== 'Resolved').map(incident => (
               <div 
                  key={incident.id} 
                  onClick={() => setSelectedIncident(incident)}
                  className="p-3 bg-slate-50 border-l-4 border-red-500 rounded cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{incident.system}</span>
                    <span className="text-[10px] text-slate-400">{new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-1 group-hover:text-[#113B92]">{incident.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                     <StatusBadge status={incident.priority} />
                     <span className="text-xs text-slate-500 truncate">{incident.assignedTeam}</span>
                  </div>
               </div>
             ))}
             {incidents.filter(i => i.status !== 'Resolved').length === 0 && (
               <div className="text-center py-10 text-slate-400 text-sm">No active alerts. Good service.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncidentTable = (mode: string) => {
    const filtered = incidents.filter(i => 
      mode === 'All' ? true : 
      mode === 'Underground' ? i.system === 'Tube' : 
      mode === 'Buses' ? i.system === 'Bus' :
      mode === 'Cycles' ? i.system === 'Bike' :
      i.system === mode
    );

    return (
      <div className="animate-in slide-in-from-right-4 duration-300">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-[#113B92]">{mode} Control Log</h2>
           <button 
             onClick={() => {
                const newInc: Partial<Incident> = {
                   title: 'New Incident',
                   description: '',
                   priority: 'Medium',
                   status: 'Open',
                   system: mode === 'All' ? 'Tube' : (mode === 'Underground' ? 'Tube' : (mode === 'Buses' ? 'Bus' : 'IT')) as any,
                   timestamp: new Date().toISOString(),
                   refId: `INC-${Math.floor(Math.random()*10000)}`,
                   assignedTeam: 'Unassigned',
                   reportedBy: appUser?.name
                };
                if (db) {
                     addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'), newInc);
                } else {
                     setIncidents(prev => [...prev, { ...newInc, id: Math.random().toString() } as Incident]);
                }
             }}
             className="bg-[#E32017] text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-red-700 transition-colors"
           >
             + Report Incident
           </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500">
                <tr>
                  <th className="p-4">Ref ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Team</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-500">{inc.refId}</td>
                    <td className="p-4 font-bold text-slate-700">{inc.title}</td>
                    <td className="p-4"><StatusBadge status={inc.priority} /></td>
                    <td className="p-4 text-slate-600 text-xs">{inc.assignedTeam}</td>
                    <td className="p-4"><StatusBadge status={inc.status} /></td>
                    <td className="p-4 text-right">
                       <button onClick={() => setSelectedIncident(inc)} className="text-[#113B92] font-bold hover:underline">OPEN CASE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    );
  };

  // --- Main Layout Return ---

  if (!appUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#113B92] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#E32017] blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 z-10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-8">
            <TfLRoundel className="w-20 h-20 mb-4" />
            <h1 className="text-2xl font-bold text-[#113B92]">Transport for London</h1>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mt-2">Operational Control System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#113B92] focus:border-[#113B92] outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#113B92] focus:border-[#113B92] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full bg-[#113B92] hover:bg-[#0d2d70] text-white font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-95">
              Secure Login
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400 border-t pt-4">
            Unauthorized access is prohibited under the Computer Misuse Act 1990.<br/>
            System ID: TFL-OPS-2025-ALPHA
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {renderIncidentModal()}
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#113B92] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-blue-900/50 bg-[#0019a8]">
          <div className="flex items-center gap-4">
            <TfLRoundel className="w-10 h-10 shrink-0 shadow-lg bg-white rounded-full" />
            <div>
              <h1 className="text-white font-bold tracking-tight text-lg leading-tight">Transport<br/>for London</h1>
            </div>
          </div>
          <div className="mt-4 text-[10px] uppercase tracking-widest text-blue-300 font-semibold">
            Logged in as: {appUser.role}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 px-3 mt-2">Core</div>
          
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          {appUser.role === 'Admin' && (
             <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'users' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
                <Users className="w-5 h-5" /> User Admin
             </button>
          )}

          <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mt-8 mb-2 px-3">Operations</div>
          
          <button onClick={() => setActiveTab('underground')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'underground' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <TrainFront className="w-5 h-5" /> Underground
          </button>
          <button onClick={() => setActiveTab('buses')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'buses' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Bus className="w-5 h-5" /> Buses & Trams
          </button>
          <button onClick={() => setActiveTab('cycles')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'cycles' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Bike className="w-5 h-5" /> Santander Cycles
          </button>
          <button onClick={() => setActiveTab('elizabeth')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'elizabeth' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Train className="w-5 h-5" /> Elizabeth Line
          </button>
           <button onClick={() => setActiveTab('it')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === 'it' ? 'bg-white text-[#113B92] font-bold shadow-lg' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Activity className="w-5 h-5" /> IT Systems
          </button>
        </nav>

        <div className="p-4 border-t border-blue-900/50 bg-[#0019a8]">
          <div className="flex items-center gap-3 w-full p-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-white text-[#113B92] flex items-center justify-center text-xs font-bold border border-blue-200 uppercase">
              {appUser.username.substring(0,2)}
            </div>
            <div className="text-left overflow-hidden flex-1">
              <div className="text-sm text-white font-medium truncate">{appUser.username}</div>
              <div className="text-xs text-blue-300 truncate">{appUser.department}</div>
            </div>
            <button onClick={handleLogout} className="text-blue-300 hover:text-white">
               <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-4 text-slate-400">
             <Search className="w-5 h-5" />
             <input type="text" placeholder="Search system logs..." className="bg-transparent border-none focus:ring-0 text-sm text-slate-800 w-80 placeholder-slate-400" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-bold bg-slate-50 px-3 py-1.5 rounded border border-slate-200 shadow-sm">
              <Clock className="w-4 h-4 text-[#113B92]" />
              {currentTime.toLocaleTimeString('en-GB')}
            </div>
            <Bell className="w-5 h-5 text-slate-400" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'underground' && renderIncidentTable('Underground')}
          {activeTab === 'buses' && renderIncidentTable('Buses')}
          {activeTab === 'cycles' && renderIncidentTable('Cycles')}
          {activeTab === 'elizabeth' && renderIncidentTable('Elizabeth Line')}
          {activeTab === 'it' && renderIncidentTable('IT')}
        </div>
      </main>
    </div>
  );
}