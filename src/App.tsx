// Posture Check Raid Tools (Roster Table + Standby + Delete Character + Remove from Roster)

import { useState, useEffect } from 'react';

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#C41E3A",
  "Demon Hunter": "#A330C9",
  "Druid": "#FF7C0A",
  "Evoker": "#33937F",
  "Hunter": "#AAD372",
  "Mage": "#3FC7EB",
  "Monk": "#00FF98",
  "Paladin": "#F48CBA",
  "Priest": "#FFFFFF",
  "Rogue": "#FFF468",
  "Shaman": "#0070DD",
  "Warlock": "#8788EE",
  "Warrior": "#C69B6D",
};
const CLASS_ROLES: Record<string, Role[]> = {
  "Death Knight": ["Tank", "Melee"],
  "Demon Hunter": ["Tank", "Melee"],
  "Druid": ["Tank", "Healer", "Melee", "Ranged"],
  "Evoker": ["Healer", "Ranged"],
  "Hunter": ["Ranged"],
  "Mage": ["Ranged"],
  "Monk": ["Tank", "Healer", "Melee"],
  "Paladin": ["Tank", "Healer", "Melee"],
  "Priest": ["Healer", "Ranged"],
  "Rogue": ["Melee"],
  "Shaman": ["Healer", "Melee", "Ranged"],
  "Warlock": ["Ranged"],
  "Warrior": ["Tank", "Melee"],
};


const ROLES = ["Tank", "Healer", "Melee", "Ranged"] as const;
type Role = (typeof ROLES)[number];
type ExtendedRole = Role | "Standby";

interface Character {
  id: string;
  name: string;
  className: string;
  roles: Role[];
}

interface BossRoster {
  bossName: string;
  icon?:string;
  assigned: {
    [key in ExtendedRole]: Character[];
  };
}



export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("Warrior");
  const [bossRosters, setBossRosters] = useState<BossRoster[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);
  const [newBossName, setNewBossName] = useState("");
  const [newBossIcon, setNewBossIcon] = useState("💀");
  
  useEffect(() => {
  const savedCharacters = localStorage.getItem("postureCheckCharacters");
  const savedRosters = localStorage.getItem("postureCheckRosters");

  if (savedCharacters) setCharacters(JSON.parse(savedCharacters));
  if (savedRosters) setBossRosters(JSON.parse(savedRosters));
}, []);

useEffect(() => {
  localStorage.setItem("postureCheckCharacters", JSON.stringify(characters));
}, [characters]);

useEffect(() => {
  localStorage.setItem("postureCheckRosters", JSON.stringify(bossRosters));
}, [bossRosters]);


  const addCharacter = () => {
  if (!name.trim()) return;
  const roles = CLASS_ROLES[className] || [];
  setCharacters([...characters, {
    id: crypto.randomUUID(),
    name,
    className,
    roles
  }]);
  setName("");
  setClassName("Warrior");
};


  const addBossRoster = () => {
    const name = newBossName.trim();
    if (!name || bossRosters.find(b => b.bossName === name)) return;
    const newRoster: BossRoster = {
      bossName: name,
      assigned: {
        Tank: [],
        Healer: [],
        Melee: [],
        Ranged: [],
        Standby: []
      },
      icon: newBossIcon  //
    };
    setBossRosters([...bossRosters, newRoster]);
    setSelectedBoss(name);
    setNewBossName("");
  };

  const assignToRole = (character: Character, role: ExtendedRole) => {
    setBossRosters(prev => prev.map(boss => {
      if (boss.bossName !== selectedBoss) return boss;
      const alreadyAssigned = Object.values(boss.assigned).some(group =>
        group.find(c => c.id === character.id)
      );
      if (alreadyAssigned) return boss;
      return {
        ...boss,
        assigned: {
          ...boss.assigned,
          [role]: [...boss.assigned[role], character]
        }
      };
    }));
  };

  const participationCount = (charId: string): number => {
    return bossRosters.reduce((count, boss) => {
      return count + Object.values(boss.assigned).reduce((roleCount, list) => {
        return roleCount + (list.some(c => c.id === charId) ? 1 : 0);
      }, 0);
    }, 0);
  };

  const currentBoss = bossRosters.find(b => b.bossName === selectedBoss);
  const icons: Record<ExtendedRole, string> = {
    Tank: '🛡️',
    Healer: '➕',
    Melee: '⚔️',
    Ranged: '🏹',
    Standby: '💤'
  };

return (
  <div
    style={{
      backgroundColor: '#1e1e1e',
      color: 'white',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Segoe UI, Roboto, sans-serif'  // ✅ Add this line
    }}
  >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
  <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>🐍</span>
  <h1 style={{ fontSize: '2rem', margin: 0 }}>Posture Check Raid Tools</h1>
</div>
      <h2 style={{ fontSize: '1rem', margin: '0.5rem 0 1rem 0', color: '#aaa' }}>
  Manage Your Raid Team
</h2>

      {/* Character Creator */}
<div style={{ marginBottom: '2rem' }}>
        <input
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.3rem', marginRight: '0.5rem', background: '#2a2a2a', border: '1px solid #444', color: 'white', fontSize: '0.85rem' }}
        />
        <select
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={{ padding: '0.3rem', marginRight: '0.5rem', background: '#2a2a2a', color: CLASS_COLORS[className], fontSize: '0.85rem' }}
        >
          {Object.keys(CLASS_COLORS).map((c) => (
            <option key={c} value={c} style={{ color: CLASS_COLORS[c] }}>{c}</option>
          ))}
        </select>
        
        <button onClick={addCharacter} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Add</button>
      </div>

      {/* Character Pool */}  
      <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Characters</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '2rem' }}>
        {characters.map((char) => (
          <div
            key={char.id}
            style={{
              position: 'relative',
              background: '#2a2a2a',
              padding: '0.3rem',
              borderRadius: '4px',
              width: '120px',
              fontSize: '0.7rem'
            }}
          >
            <button onClick={() => setCharacters(characters.filter(c => c.id !== char.id))} title="Remove" style={{ position: 'absolute', top: '4px', right: '4px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>🗑️</button>
            <div style={{ color: CLASS_COLORS[char.className], fontSize: '0.9rem', fontWeight: 'bold' }}>{char.name}</div>
            <div>{char.className}</div>
            <div>Roles: {char.roles.join(", ")}</div>
            <div>{participationCount(char.id)} fight(s)</div>
            <div style={{ marginTop: '0.3rem' }}>
              {[...char.roles, "Standby"].map((role) => (
                <button
                  key={role}
                  onClick={() => assignToRole(char, role as ExtendedRole)}
                  title={role}
                  style={{ marginRight: '0.2rem', padding: '0.15rem 0.4rem', fontSize: '0.9rem' }}
                >
                  {icons[role as ExtendedRole]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#aaa' }}>
  Edit Your Roster
</h2>
      {/* Roster Tabs + Creator */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          placeholder="New Boss Name"
          value={newBossName}
          onChange={(e) => setNewBossName(e.target.value)}
          style={{ padding: '0.3rem', marginRight: '0.5rem', background: '#2a2a2a', color: 'white', fontSize: '0.85rem' }}
        />
        <select
          value={newBossIcon}
          onChange={(e) => setNewBossIcon(e.target.value)}
          style={{ padding: '0.3rem', marginRight: '0.5rem', background: '#2a2a2a', color: 'white', fontSize: '0.85rem' }}
        >
          <option value="💀">💀</option>
          <option value="🅰️">🅰️</option>
          <option value="🅱️">🅱️</option>
          <option value="1️⃣">1️⃣</option>
          <option value="2️⃣">2️⃣</option>
          <option value="3️⃣">3️⃣</option>
          <option value="👑">👑</option>
          <option value="❤️">❤️</option>
          <option value="🍆">🍆</option>
        </select>
        <button onClick={addBossRoster} style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}>Create New Roster</button>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {bossRosters.map(b => (
            <button
              key={b.bossName}
              onClick={() => setSelectedBoss(b.bossName)}
              style={{
                backgroundColor: selectedBoss === b.bossName ? '#444' : '#2a2a2a',
                color: 'white',
                padding: '0.3rem 0.6rem',
                border: '1px solid #666',
                borderRadius: '4px'
              }}
            >
              {b.icon || "❓"} {b.bossName}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Roster Table */}
      {currentBoss && (
        <>
          <h2 style={{ fontSize: '1.1rem' }}>{currentBoss.bossName} Roster</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr>
                {([...ROLES, "Standby"] as ExtendedRole[]).map(role => (
                  <th key={role} style={{ borderBottom: '1px solid #555', padding: '0.5rem', textAlign: 'left' }}>{icons[role]} {role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {([...ROLES, "Standby"] as ExtendedRole[]).map(role => (
                  <td key={role} style={{ verticalAlign: 'top', padding: '0.5rem', width: '200px' }}>
                    {currentBoss.assigned[role].map(char => (
                      <div key={char.id} style={{ background: '#333', padding: '0.2rem', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                        <span style={{ color: CLASS_COLORS[char.className] }}>{char.name}</span> ({char.className})
                        <button onClick={() => setBossRosters(prev => prev.map(b => b.bossName !== selectedBoss ? b : {
                          ...b,
                          assigned: {
                            ...b.assigned,
                            [role]: b.assigned[role].filter(c => c.id !== char.id)
                          }
                        }))} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', float: 'right', marginLeft: 'auto' }}>−</button>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
