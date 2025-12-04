import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
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
  Plus, 
  Trash2, 
  CheckCircle, 
  X, 
  Database,
  Wrench,
  MapPin
} from 'lucide-react';

// --- Konfiguration ---
const firebaseConfig = {
  apiKey: "DEMO_KEY",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "000000000",
  appId: "1:00000000:web:abcdef"
};

let app: any;
let db: any;
let isDemoMode = true;

try {
    if (firebaseConfig.apiKey !== "DEMO_KEY") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        isDemoMode = false;
    }
} catch (e: any) {
    console.warn("Starte im Simulations-Modus.");
}

const appId = 'tfl-production-app'; 

// --- Datenstrukturen ---

const OPERATIONAL_UNITS = {
  Tube: ['Neasden Depot (Jubilee/Met)', 'Ruislip Depot (Central)', 'Cockfosters Depot (Picc)', 'Northumberland Park (Victoria)', 'Stratford Market Depot'],
  Bus: ['Walworth Garage (Go-Ahead)', 'West Ham Garage (Stagecoach)', 'Willesden Junction (Metroline)', 'Battersea Depot', 'Lea Interchange'],
  Elizabeth: ['Old Oak Common Depot', 'Maidenhead Sidings', 'Ilford Depot'],
  IT: ['TfL Tech Service Ops (TSO)', 'Network Command (Cyber)', 'Ticketing Support (Cubic)', 'Signal Engineering'],
  Bike: ['Santander Cycle Logistics (Pentonville)', 'Rapid Response Unit South']
};

interface Vehicle {
  id: string;
  type: 'Tube' | 'Bus' | 'Bike' | 'Train';
  model: string;
  status: 'In Service' | 'Depot' | 'Maintenance' | 'Defect';
  location: string;
  battery?: number; 
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
  logs?: { timestamp: string, author: string, message: string }[];
}

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

const SERVICE_STATUS = [
  { line: 'Bakerloo', status: 'Good Service', color: 'bg-[#B36305]' },
  { line: 'Central', status: 'Severe Delays', color: 'bg-[#E32017]' },
  { line: 'Circle', status: 'Good Service', color: 'bg-[#FFD300]' },
  { line: 'District', status: 'Minor Delays', color: 'bg-[#00782A]' },
  { line: 'Hammersmith', status: 'Good Service', color: 'bg-[#F3A9BB]' },
  { line: 'Jubilee', status: 'Good Service', color: 'bg-[#A0A5A9]' },
  { line: 'Victoria', status: 'Good Service', color: 'bg-[#0098D4]' },
];

// --- Mock Data Generator (Für große Flotten) ---
const generateMockFleet = (): Vehicle[] => {
    const fleet: Vehicle[] = [];
    const statuses: Vehicle['status'][] = ['In Service', 'In Service', 'In Service', 'Depot', 'Maintenance'];
    
    // 1. Tube (30 Stück)
    for (let i = 1; i <= 30; i++) {
        fleet.push({
            id: `T-1992-${String(i).padStart(3, '0')}`,
            type: 'Tube',
            model: i < 15 ? '1992 Stock' : '2009 Stock',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            location: i < 15 ? 'Central Line Loop' : 'Victoria Line Southbound'
        });
    }
    // 2. Busse (40 Stück)
    for (let i = 1; i <= 40; i++) {
        fleet.push({
            id: `B-LT-${String(i + 100).padStart(3, '0')}`,
            type: 'Bus',
            model: i < 20 ? 'New Routemaster' : 'BYD Electric',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            location: `Route ${Math.floor(Math.random() * 50) + 1} - Central`,
            battery: i >= 20 ? Math.floor(Math.random() * 100) : undefined
        });
    }
    // 3. Bikes (50 Stück)
    for (let i = 1; i <= 50; i++) {
        fleet.push({
            id: `C-${String(i + 8000)}`,
            type: 'Bike',
            model: 'Pashley Cycle',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            location: `Docking Stn: Zone ${Math.floor(Math.random() * 2) + 1}`
        });
    }
    // 4. Elizabeth Line (30 Stück) - Erhöht auf 30
    for (let i = 1; i <= 30; i++) {
        fleet.push({
            id: `EL-345-${String(i).padStart(2, '0')}`,
            type: 'Train',
            model: 'Class 345',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            location: i % 2 === 0 ? 'Paddington - Abbey Wood' : 'Shenfield - Liverpool St'
        });
    }
    return fleet;
};

// Initial Data Setup
const INITIAL_INCIDENTS: Incident[] = [
    { id: '1', refId: 'INC-2025-88', title: 'Signal Failure Baker St', description: 'Signal failure on southbound line.', priority: 'Critical', status: 'Open', system: 'Tube', assignedTeam: 'Neasden Depot', reportedBy: 'System', timestamp: new Date().toISOString() }
];

// --- Komponenten ---

const TfLRoundel = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={`${className} relative flex items-center justify-center`}>
    <div className="absolute inset-0 rounded-full border-[6px] border-[#E32017] bg-white/10"></div>
    <div className="absolute w-[120%] h-[20%] bg-[#003688] z-10"></div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  let colors = 'bg-gray-100 text-gray-800 border-gray-200';
  if (['Good Service', 'Resolved', 'Active', 'In Service'].includes(status)) colors = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (['Minor Delays', 'In Progress', 'Break', 'Depot'].includes(status)) colors = 'bg-amber-100 text-amber-800 border-amber-200';
  if (['Severe Delays', 'Critical', 'Suspended', 'Defect'].includes(status)) colors = 'bg-rose-100 text-rose-800 border-rose-200';
  if (['Maintenance', 'High'].includes(status)) colors = 'bg-orange-100 text-orange-800 border-orange-200';
  if (['Open'].includes(status)) colors = 'bg-blue-100 text-blue-800 border-blue-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors}`}>
      {status.toUpperCase()}
    </span>
  );
};

// --- Haupt App ---

export default function TfLControl() {
  // Login State
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newLogMessage, setNewLogMessage] = useState('');

  // Data State (LocalStorage Persistence)
  // Wir laden erst beim Start, falls vorhanden
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
      const saved = localStorage.getItem('tfl_users');
      return saved ? JSON.parse(saved) : [];
  });
  const [incidents, setIncidents] = useState<Incident[]>(() => {
      const saved = localStorage.getItem('tfl_incidents');
      return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });
  
  // FIX: Wir entfernen das 'setFleet' aus dem Destructuring, da wir es nicht benutzen.
  // Das behebt den "declared but never read" Fehler.
  const [fleet] = useState<Vehicle[]>(() => {
      const saved = localStorage.getItem('tfl_fleet');
      return saved ? JSON.parse(saved) : generateMockFleet();
  });
  
  const [editingUser, setEditingUser] = useState<Partial<AppUser>>({});

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Persistence Effects ---
  useEffect(() => {
      if (isDemoMode) localStorage.setItem('tfl_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
      if (isDemoMode) localStorage.setItem('tfl_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
      if (isDemoMode) localStorage.setItem('tfl_fleet', JSON.stringify(fleet));
  }, [fleet]);


  // Firebase Listener
  useEffect(() => {
    if (!db) return;
    
    try {
        const usersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'app_users'));
        const unsubUsers = onSnapshot(usersQuery, (snapshot: any) => {
            const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as AppUser));
            setUsersList(data);
        }, () => console.log("Demo Mode: Using local user list"));

        const incQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'));
        const unsubInc = onSnapshot(incQuery, (snapshot: any) => {
            setIncidents(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Incident)));
        });

        return () => { unsubUsers(); unsubInc(); };
    } catch(e: any) { console.log("Demo Mode Active"); }
  }, []);

  // --- Funktionen (Logik) ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const demoUser = usersList.find(u => u.username === loginUsername && u.password === loginPassword);
    
    if (loginUsername === 'admin' && loginPassword === 'admin123') {
        setAppUser(demoUser || {
            id: 'admin', username: 'admin', name: 'System Administrator', email: 'admin@tfl.gov.uk', 
            role: 'Admin', department: 'Central Ops', hub: 'Blackfriars'
        });
        return;
    }

    if (demoUser) {
        setAppUser(demoUser);
    } else {
        setLoginError('Invalid credentials. (Try: admin / admin123)');
    }
  };

  const handleCreateIncident = (mode: string) => {
      const systemType = mode === 'Underground' ? 'Tube' : (mode === 'Buses' ? 'Bus' : (mode === 'Cycles' ? 'Bike' : 'IT'));
      const newInc: Incident = {
          id: Math.random().toString(36).substr(2, 9),
          refId: `INC-${Math.floor(Math.random() * 10000)}`,
          title: 'New Incident Report',
          description: 'Please enter details...',
          priority: 'Medium',
          status: 'Open',
          system: systemType as any,
          assignedTeam: 'Unassigned',
          reportedBy: appUser?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          logs: []
      };

      if (db) {
          addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'), newInc);
      } else {
          setIncidents(prev => [newInc, ...prev]);
      }
      setSelectedIncident(newInc);
  };

  const handleSaveUser = async () => {
      if (!editingUser.username) return;
      
      const newUser: AppUser = {
          id: editingUser.id || Math.random().toString(36),
          username: editingUser.username,
          password: editingUser.password || '1234',
          name: editingUser.name || 'New Staff',
          email: editingUser.email || '',
          role: editingUser.role || 'Viewer',
          department: editingUser.department || 'Ops',
          hub: editingUser.hub || 'HQ'
      };

      if (db) {
          try {
            if (editingUser.id) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_users', editingUser.id), newUser as any);
            } else {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'app_users'), newUser);
            }
          } catch(e) { alert("DB Error"); }
      } else {
          setUsersList(prev => {
              if (editingUser.id) return prev.map(u => u.id === newUser.id ? newUser : u);
              return [...prev, newUser];
          });
      }
      
      setIsUserModalOpen(false);
      setEditingUser({});
  };

  const handleAddLog = async () => {
      if (!selectedIncident || !newLogMessage) return;
      const log = { timestamp: new Date().toISOString(), author: appUser?.name || 'Admin', message: newLogMessage };
      const updatedIncident = { ...selectedIncident, logs: [...(selectedIncident.logs || []), log] };
      
      if (db) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', selectedIncident.id), { logs: updatedIncident.logs });
      } else {
          setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
      }
      
      setSelectedIncident(updatedIncident);
      setNewLogMessage('');
  };

  const handleUpdateIncident = async (field: string, value: string) => {
      if (!selectedIncident) return;
      const updated = { ...selectedIncident, [field]: value };
      
      if (db) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', selectedIncident.id), { [field]: value });
      } else {
          setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
      }
      setSelectedIncident(updated);
  };

  const deleteUser = async (id: string) => {
    if (confirm('Delete user?')) {
        if (db) {
            try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_users', id)); }
            catch(e) { alert("DB Error"); }
        } else {
            setUsersList(prev => prev.filter(x => x.id !== id));
        }
    }
  };

  // --- Sub-Renderers ---

  const renderIncidentModal = () => {
    if (!selectedIncident) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-xl">
             <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className="font-mono text-slate-500 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">{selectedIncident.refId}</span>
                   <StatusBadge status={selectedIncident.priority} />
                </div>
                <input 
                    className="text-2xl font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full" 
                    value={selectedIncident.title}
                    onChange={(e) => handleUpdateIncident('title', e.target.value)}
                />
             </div>
             <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
               <X className="w-6 h-6" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="text-xs font-bold text-blue-800 uppercase mb-1 block">Description</label>
                  <textarea 
                    className="w-full bg-transparent border-none text-slate-800 focus:ring-0 p-0 resize-none h-20"
                    value={selectedIncident.description}
                    onChange={(e) => handleUpdateIncident('description', e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Team</label>
                    <select 
                      value={selectedIncident.assignedTeam}
                      onChange={(e) => handleUpdateIncident('assignedTeam', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#113B92]"
                    >
                      <option value="Unassigned">Unassigned</option>
                      {Object.entries(OPERATIONAL_UNITS).map(([key, units]) => (
                          <optgroup key={key} label={key}>
                              {units.map(u => <option key={u} value={u}>{u}</option>)}
                          </optgroup>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select 
                      value={selectedIncident.status}
                      onChange={(e) => handleUpdateIncident('status', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#113B92]"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Live Logs</label>
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-60 overflow-y-auto space-y-4 mb-4">
                    {selectedIncident.logs?.map((log, idx) => (
                      <div key={idx} className="flex gap-3 text-sm">
                        <div className="font-bold text-[#113B92]">{log.author}:</div>
                        <div className="text-slate-600">{log.message} <span className="text-xs text-slate-400 ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                      </div>
                    ))}
                    {!selectedIncident.logs?.length && <div className="text-center text-slate-400 text-sm mt-10">No logs recorded.</div>}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newLogMessage}
                      onChange={(e) => setNewLogMessage(e.target.value)}
                      placeholder="Type operational update..."
                      className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#113B92]"
                    />
                    <button onClick={handleAddLog} className="bg-[#113B92] text-white px-4 rounded-lg font-bold hover:bg-blue-800">Send</button>
                 </div>
               </div>
            </div>

            <div className="border-l border-slate-100 pl-6 space-y-6">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase">System</h4>
                    <div className="text-lg font-bold text-slate-800">{selectedIncident.system}</div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Reported By</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>{selectedIncident.reportedBy}</span>
                    </div>
                </div>
                <div className="pt-10">
                    <button 
                        onClick={() => handleUpdateIncident('status', 'Resolved')}
                        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" /> Resolve
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationsView = (mode: string) => {
    const filteredIncidents = incidents.filter(i => 
        mode === 'All' ? true : 
        mode === 'Underground' ? i.system === 'Tube' : 
        mode === 'Buses' ? i.system === 'Bus' :
        mode === 'Cycles' ? i.system === 'Bike' :
        mode === 'Elizabeth Line' ? i.system === 'Elizabeth Line' :
        i.system === 'IT'
    );

    const filteredFleet = fleet.filter(v => 
        mode === 'Underground' ? v.type === 'Tube' :
        mode === 'Buses' ? v.type === 'Bus' :
        mode === 'Cycles' ? v.type === 'Bike' :
        mode === 'Elizabeth Line' ? v.type === 'Train' :
        false
    );

    return (
      <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
         <div className="flex justify-between items-center">
           <h2 className="text-3xl font-bold text-[#113B92] flex items-center gap-3">
               {mode === 'Underground' && <TrainFront className="w-8 h-8"/>}
               {mode === 'Buses' && <Bus className="w-8 h-8"/>}
               {mode === 'Cycles' && <Bike className="w-8 h-8"/>}
               {mode === 'Elizabeth Line' && <Train className="w-8 h-8"/>}
               {mode} Control
           </h2>
           <button 
             onClick={() => handleCreateIncident(mode)}
             className="bg-[#E32017] text-white px-5 py-2.5 rounded-lg font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2"
           >
             <Plus className="w-5 h-5" /> New Incident
           </button>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Active Logs
                </h3>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{filteredIncidents.length}</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4">Ref ID</th>
                  <th className="p-4">Issue</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assigned Team</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-500">{inc.refId}</td>
                    <td className="p-4 font-bold text-slate-700">{inc.title}</td>
                    <td className="p-4"><StatusBadge status={inc.priority} /></td>
                    <td className="p-4 text-slate-600">{inc.assignedTeam}</td>
                    <td className="p-4"><StatusBadge status={inc.status} /></td>
                    <td className="p-4 text-right">
                       <button onClick={() => setSelectedIncident(inc)} className="text-[#113B92] font-bold hover:underline">OPEN</button>
                    </td>
                  </tr>
                ))}
                {filteredIncidents.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No active incidents. Service running smoothly.</td></tr>
                )}
              </tbody>
            </table>
         </div>

         {mode !== 'IT' && (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-500" /> Fleet Database ({mode})
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs bg-white border border-slate-300 px-3 py-1 rounded hover:bg-slate-50 font-medium">Export CSV</button>
                    </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-white text-slate-500 border-b border-slate-200 uppercase text-xs font-bold sticky top-0 z-10">
                        <tr>
                        <th className="p-4 bg-white">Vehicle ID</th>
                        <th className="p-4 bg-white">Model</th>
                        <th className="p-4 bg-white">Current Location</th>
                        <th className="p-4 bg-white">Status</th>
                        <th className="p-4 bg-white text-right">Manage</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredFleet.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50">
                            <td className="p-4 font-mono font-bold text-slate-700">{v.id}</td>
                            <td className="p-4 text-slate-600">{v.model}</td>
                            <td className="p-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-slate-400" /> {v.location}
                            </td>
                            <td className="p-4"><StatusBadge status={v.status} /></td>
                            <td className="p-4 text-right">
                            <button className="text-slate-400 hover:text-[#113B92]"><Wrench className="w-4 h-4" /></button>
                            </td>
                        </tr>
                        ))}
                        {filteredFleet.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No fleet data available for this sector in demo mode.</td></tr>
                        )}
                    </tbody>
                    </table>
                </div>
             </div>
         )}
      </div>
    );
  };

  // --- Login Screen ---
  if (!appUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#113B92] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://tfl.gov.uk/cdn/static/cms/images/logos/tfl-logo.png')] bg-no-repeat bg-center opacity-5"></div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-10 z-10">
          <div className="flex flex-col items-center mb-8">
            <TfLRoundel className="w-20 h-20 mb-6" />
            <h1 className="text-3xl font-bold text-[#113B92]">Transport for London</h1>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold mt-2">Operational Control System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
              <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#113B92] focus:border-[#113B92]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#113B92]" />
            </div>
            {loginError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{loginError}</div>}
            <button type="submit" className="w-full bg-[#113B92] hover:bg-[#092055] text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-95">Login to Network</button>
          </form>
          {isDemoMode && <div className="mt-6 text-center text-xs text-orange-500 font-medium bg-orange-50 p-2 rounded">Simulation Mode Active (Local DB)</div>}
        </div>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {renderIncidentModal()}
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#113B92] text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-blue-900/50 bg-[#0019a8]">
          <div className="flex items-center gap-4">
            <TfLRoundel className="w-10 h-10 shrink-0 shadow-lg bg-white rounded-full" />
            <div className="leading-tight">
              <h1 className="text-white font-bold text-lg">TfL Ops</h1>
              <span className="text-[10px] text-blue-200 uppercase tracking-wider">Control Centre</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2 px-3 mt-4">Monitoring</div>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2 px-3 mt-6">Modes & Fleet</div>
          <button onClick={() => setActiveTab('underground')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'underground' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <TrainFront className="w-5 h-5" /> Underground
          </button>
          <button onClick={() => setActiveTab('buses')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'buses' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Bus className="w-5 h-5" /> Buses
          </button>
          <button onClick={() => setActiveTab('cycles')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'cycles' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Bike className="w-5 h-5" /> Cycles
          </button>
          <button onClick={() => setActiveTab('elizabeth')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'elizabeth' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Train className="w-5 h-5" /> Elizabeth Line
          </button>
          
          <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2 px-3 mt-6">System</div>
          <button onClick={() => setActiveTab('it')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'it' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
            <Activity className="w-5 h-5" /> IT Status
          </button>
          {appUser.role === 'Admin' && (
             <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-white text-[#113B92] font-bold' : 'hover:bg-blue-800 text-blue-100'}`}>
                <Users className="w-5 h-5" /> Staff Admin
             </button>
          )}
        </nav>

        <div className="p-4 bg-[#092055]">
          <div className="flex items-center gap-3 w-full p-2 rounded-lg bg-blue-900/50 border border-blue-800">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-xs font-bold">
              {appUser.username.substring(0,2).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden flex-1">
              <div className="text-sm text-white font-medium truncate">{appUser.name}</div>
              <div className="text-[10px] text-blue-300 truncate">{appUser.role}</div>
            </div>
            <button onClick={() => setAppUser(null)} className="text-blue-300 hover:text-white" title="Logout">
               <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4 text-slate-400 w-1/3">
             <Search className="w-5 h-5" />
             <input type="text" placeholder="Search system, asset ID, or logs..." className="bg-transparent border-none focus:ring-0 text-sm text-slate-800 w-full placeholder-slate-400" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-600 text-sm font-mono bg-slate-50 px-3 py-1.5 rounded border border-slate-200 shadow-sm">
              <Clock className="w-4 h-4 text-[#113B92]" />
              {currentTime.toLocaleTimeString('en-GB')}
            </div>
            <div className="relative cursor-pointer">
                <Bell className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          {activeTab === 'dashboard' && (
              <div className="space-y-6">
                  {/* Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Network Status</div>
                          <div className="text-2xl font-bold text-emerald-600">Good Service</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Open Incidents</div>
                          <div className="text-2xl font-bold text-slate-800">{incidents.filter(i => i.status !== 'Resolved').length}</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Active Fleet</div>
                          <div className="text-2xl font-bold text-slate-800">{fleet.filter(f => f.status === 'In Service').length}</div>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 uppercase mb-2">Shift Manager</div>
                          <div className="text-2xl font-bold text-slate-800">S. Khan</div>
                      </div>
                  </div>
                  
                  {/* Line Status */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                          <h3 className="font-bold text-[#113B92] mb-4">Underground Status</h3>
                          <div className="space-y-2">
                              {SERVICE_STATUS.map(s => (
                                  <div key={s.line} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-100">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-2 h-6 ${s.color} rounded-sm`}></div>
                                          <span className="font-bold text-sm text-slate-700">{s.line}</span>
                                      </div>
                                      <StatusBadge status={s.status} />
                                  </div>
                              ))}
                          </div>
                      </div>
                      {/* Recent Alerts */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                          <h3 className="font-bold text-[#113B92] mb-4">Live Alerts</h3>
                          <div className="space-y-3">
                              {incidents.slice(0, 5).map(inc => (
                                  <div key={inc.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm">
                                      <div className="flex justify-between">
                                          <span className="font-bold text-slate-800">{inc.title}</span>
                                          <span className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <div className="text-slate-600 mt-1">{inc.system} - {inc.priority}</div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}
          {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#113B92]">User Management</h2>
                      <button 
                        onClick={() => { setEditingUser({}); setIsUserModalOpen(true); }} 
                        className="bg-[#113B92] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                      >
                          <Plus className="w-4 h-4" /> Add User
                      </button>
                  </div>
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                          <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Department</th><th className="p-3 text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                          {usersList.map(u => (
                              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                                  <td className="p-3 font-bold">{u.name}</td>
                                  <td className="p-3">{u.role}</td>
                                  <td className="p-3">{u.department}</td>
                                  <td className="p-3 text-right">
                                      <button onClick={() => {
                                          if(confirm('Delete user?')) deleteUser(u.id);
                                      }} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                  </td>
                              </tr>
                          ))}
                          {usersList.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">No users created yet (Demo Mode).</td></tr>}
                      </tbody>
                  </table>
                  
                  {isUserModalOpen && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
                              <h3 className="font-bold text-lg mb-4">Add User</h3>
                              <input placeholder="Username" className="w-full mb-2 p-2 border rounded" onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                              <input placeholder="Full Name" className="w-full mb-2 p-2 border rounded" onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                              <select className="w-full mb-4 p-2 border rounded" onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                                  <option>Viewer</option><option>Dispatcher</option><option>Admin</option>
                              </select>
                              <div className="flex justify-end gap-2">
                                  <button onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                                  <button onClick={handleSaveUser} className="px-4 py-2 bg-[#113B92] text-white rounded font-bold">Save</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}
          {activeTab === 'underground' && renderOperationsView('Underground')}
          {activeTab === 'buses' && renderOperationsView('Buses')}
          {activeTab === 'cycles' && renderOperationsView('Cycles')}
          {activeTab === 'elizabeth' && renderOperationsView('Elizabeth Line')}
          {activeTab === 'it' && renderOperationsView('IT')}
        </div>
      </main>
    </div>
  );
}