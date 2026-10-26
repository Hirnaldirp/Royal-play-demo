 "use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type UserProfile = { display_name: string | null; demo_points: number };

const games = [
  { icon: "🎰", name: "Slot Studio", type: "SIMULASI", desc: "Putar gulungan demo tanpa nilai uang." },
  { icon: "🎡", name: "Roulette Lab", type: "SIMULASI", desc: "Pelajari probabilitas roulette." },
  { icon: "🂡", name: "Blackjack Table", type: "SIMULASI", desc: "Latihan strategi kartu." },
  { icon: "⚽", name: "Prediksi Bola", type: "PREDIKSI DEMO", desc: "Pilih hasil pertandingan fiktif." },
  { icon: "🔢", name: "Undian Angka", type: "SIMULASI", desc: "Undian angka untuk demonstrasi." },
  { icon: "🃏", name: "Card Room", type: "SIMULASI", desc: "Meja permainan kartu demo." }
];

export default function Lounge() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [points, setPoints] = useState(0);

  async function refresh() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
      if (user) {
        const { data } = await supabase.from("profiles").select("display_name,demo_points").eq("id", user.id).maybeSingle();
        if (data) { setProfile(data as UserProfile); setPoints(data.demo_points); }
      } else { setProfile(null); }
    } catch (e) { setMessage(e instanceof Error ? e.message : "Gagal memuat konfigurasi."); }
  }

  useEffect(() => { void refresh(); }, []);

  async function signUp() {
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name.trim().slice(0, 40) } }
      });
      if (error) throw error;
      setMessage("Pendaftaran dikirim. Periksa email untuk konfirmasi jika fitur konfirmasi diaktifkan.");
      await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Pendaftaran gagal."); }
    finally { setBusy(false); }
  }

  async function signIn() {
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage("Berhasil masuk.");
      await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Login gagal."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    try { const supabase = createClient(); await supabase.auth.signOut(); setMessage("Anda telah keluar."); await refresh(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Logout gagal."); }
  }

  async function playDemo(game: string) {
    if (!userEmail) { setMessage("Masuk untuk mencatat hasil simulasi."); return; }
    setMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("play_demo_round", { p_game: game });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (row?.demo_points !== undefined) { setPoints(row.demo_points); setProfile(p => p ? { ...p, demo_points: row.demo_points } : p); }
      setMessage(`Simulasi selesai: ${game}. Perubahan poin virtual: ${row?.delta_points ?? 0 >= 0 ? "+" : ""}${row?.delta_points ?? 0}.`);
    } catch (e) {
      setMessage(e instanceof Error ? `${e.message} Pastikan schema.sql sudah dijalankan.` : "Simulasi gagal.");
    }
  }

  return <main>
    <div className="topline"><span className="brand-mark">R</span><span className="brand">ROYAL<span>PLAY</span></span><span className="demo-pill">DEMO LOUNGE</span><div className="spacer"/><a className="nav-link" href="#games">Permainan</a><a className="nav-link" href="#account">Akun</a></div>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="dot"/> RUANG PERMAINAN VIRTUAL</div>
        <h1>Play the moment.<br/><em>Keep it virtual.</em></h1>
        <p>Jelajahi permainan bergaya casino dalam lingkungan demo. Tidak ada deposit, penarikan, taruhan, atau uang sungguhan.</p>
        <a className="primary" href="#games">Jelajahi permainan <span>↘</span></a>
      </div>
      <div className="hero-art" aria-label="Ilustrasi kartu dan koin dekoratif">
        <div className="orb orb-one"/><div className="orb orb-two"/><div className="playing-card card-back">♠</div><div className="playing-card card-front"><small>A</small><strong>♦</strong><small className="bottom">A</small></div><div className="coin">R</div>
        <div className="art-caption">VIRTUAL PLAY<br/><b>EST. 2026</b></div>
      </div>
    </section>
    <div className="notice"><span>ⓘ</span><div><b>MODE SIMULASI AKTIF</b><p>Poin hanya untuk demonstrasi. Tidak memiliki nilai tunai dan tidak dapat diuangkan.</p></div></div>
    <section id="games" className="section">
      <div className="section-head"><div><div className="eyebrow">PILIH RUANGAN</div><h2>Explore the lounge</h2></div><span className="muted">06 RUANGAN DEMO</span></div>
      <div className="game-grid">{games.map((g, i) => <article className="game-card" key={g.name}><div className={`game-icon icon-${i}`}>{g.icon}</div><div className="game-meta">{g.type}</div><h3>{g.name}</h3><p>{g.desc}</p><button onClick={() => void playDemo(g.name)} className="play-btn">Jalankan demo <span>↗</span></button></article>)}</div>
    </section>
    <section id="account" className="account-section">
      <div><div className="eyebrow">AREA PERSONAL</div><h2>Member lounge</h2><p className="muted">Masuk untuk menyimpan aktivitas simulasi di database.</p>
        {userEmail ? <div className="signed-in"><span className="avatar">{(profile?.display_name || userEmail).slice(0,1).toUpperCase()}</span><div><b>{profile?.display_name || "Member"}</b><small>{userEmail}</small></div><button className="secondary" onClick={() => void signOut()}>Keluar</button></div> :
        <div className="auth-form"><label>Nama tampilan (untuk daftar)<input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="Nama kamu"/></label><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="nama@email.com"/></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" minLength={8} placeholder="Minimal 8 karakter"/></label><div className="auth-actions"><button disabled={busy || !email || password.length < 8} onClick={() => void signIn()} className="secondary">Login</button><button disabled={busy || !email || password.length < 8} onClick={() => void signUp()} className="primary">Daftar akun</button></div></div>}
        {message && <div role="status" className="message">{message}</div>}
      </div>
      <div className="wallet"><div className="wallet-top"><span>POIN VIRTUAL</span><span className="wallet-icon">✦</span></div><div className="balance">{userEmail ? points.toLocaleString("id-ID") : "—"} <small>PTS</small></div><p>{userEmail ? "Saldo demo dari database" : "Login untuk melihat poin virtual"}</p><div className="wallet-line"/><div className="wallet-foot"><span>UANG SUNGGUHAN</span><b>TIDAK AKTIF</b></div></div>
    </section>
    <footer><span className="brand">ROYAL<span>PLAY</span></span><span>Prototipe demonstrasi • Tidak menerima uang sungguhan</span><span>© 2026</span></footer>
  </main>;
}