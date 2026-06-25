// WM 2026 KO-Runden Injector v2
// Echte Gruppensieger (Stand 25.06.2026):
// A1=Mexiko A2=SüdAfrika  B1=Schweiz B2=Kanada  C1=Brasilien C2=Marokko
// D1=USA D2=Australien  E1=Deutschland E2=Elfenbeinküste  F1=Niederlande F2=Japan
// G1=Ägypten G2=Iran  H1=Spanien H2=Uruguay  I1=Frankreich I2=Norwegen
// J1=Argentinien J2=Österreich  K1=Kolumbien K2=Portugal  L1=England L2=Kroatien
// Beste 4 Drittplatzierte noch offen (Spieltag 3 läuft)
// WICHTIG: In K.O.-Runden KEIN Unentschieden → immer klarer Sieger.
// Falls 90' unentschieden → Verlängerung + Elfmeter → Prognose zeigt Elfmeter-Ergebnis (z.B. 4:3 n.E.)

(function() {
  // === CSS ===
  const style = document.createElement('style');
  style.textContent = `
.ko-badge{background:color-mix(in srgb,var(--violet) 20%, transparent);color:var(--violet);border:1px solid color-mix(in srgb,var(--violet) 35%, var(--line));font-size:11px;font-weight:800;padding:4px 8px;border-radius:999px}
.ko-card{border-color:color-mix(in srgb,var(--violet) 25%, var(--line))}
.ko-card:hover{border-color:var(--violet);box-shadow:0 8px 32px rgba(179,139,255,.2)}
.ko-section-header{display:flex;align-items:center;gap:12px;margin:24px 0 12px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.ko-round-badge{padding:6px 14px;border-radius:999px;font-size:13px;font-weight:900;letter-spacing:.04em;display:inline-block}
.ko-round-badge.r32{background:color-mix(in srgb,#f3b83b 18%, transparent);color:#f3b83b;border:1px solid color-mix(in srgb,#f3b83b 35%,var(--line))}
.ko-round-badge.af{background:color-mix(in srgb,#67a4ff 18%, transparent);color:#67a4ff;border:1px solid color-mix(in srgb,#67a4ff 35%,var(--line))}
.ko-round-badge.vf{background:color-mix(in srgb,#49d28c 18%, transparent);color:#49d28c;border:1px solid color-mix(in srgb,#49d28c 35%,var(--line))}
.ko-round-badge.hf{background:color-mix(in srgb,#ff5d73 18%, transparent);color:#ff5d73;border:1px solid color-mix(in srgb,#ff5d73 35%,var(--line))}
.ko-round-badge.finale{background:linear-gradient(135deg,rgba(243,184,59,.3),rgba(179,139,255,.2));color:#f3b83b;border:2px solid #f3b83b;font-size:14px}
.ko-round-info{font-size:12px;color:var(--muted);font-weight:600}
.ko-winner{color:var(--gold);font-weight:700;font-size:12px;margin-bottom:6px;padding:6px 10px;background:rgba(243,184,59,.07);border-radius:8px;border-left:3px solid var(--gold)}
.mc-pen{font-size:11px;color:var(--violet);margin-bottom:8px;padding:5px 10px;background:rgba(179,139,255,.08);border-radius:8px;border-left:3px solid var(--violet)}
.ko-intro{background:linear-gradient(135deg,rgba(179,139,255,.08),rgba(103,164,255,.06));border:1px solid color-mix(in srgb,var(--violet) 25%,var(--line));border-radius:14px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:var(--muted);line-height:1.6}
.ko-intro strong{color:var(--text)}
.ko-stat-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.ko-stat-box{flex:1;min-width:130px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center}
.ko-stat-box .val{font-size:22px;font-weight:900;color:var(--gold)}
.ko-stat-box .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:2px}
.ko-pen-tag{display:inline-block;padding:2px 7px;border-radius:999px;background:rgba(179,139,255,.18);color:var(--violet);font-size:10px;font-weight:800;margin-left:6px;letter-spacing:.05em}
`;
  document.head.appendChild(style);

  // === NAV BUTTON ===
  const navrow = document.querySelector('.navrow');
  if (navrow) {
    const btn = document.createElement('button');
    btn.className = 'navbtn';
    btn.textContent = '⚡ K.O.-Runden';
    btn.onclick = function() { switchTab('ko', btn); };
    navrow.appendChild(btn);
  }

  function cc(c) {
    if (c==='Sehr hoch') return '#49d28c';
    if (c==='Hoch') return '#67a4ff';
    if (c==='Mittel') return '#f3b83b';
    return '#ff5d73';
  }

  // prognose90 = Ergebnis nach 90' (z.B. "1:1")
  // proNE = Ergebnis nach Verlängerung+Elfmeter wenn nötig (z.B. "4:3 n.E.") oder null
  // winner = klarer Sieger-Name
  // penPct = Wahrscheinlichkeit Elfmeter (0 wenn 90' entschieden)
  function koCard(idx, datum, zeit, t1, f1, t2, f2, venue, prognose90, proNE, winner, penPct, conf) {
    const ccolor = cc(conf);
    const mid = `ko${idx}`;
    const isPen = proNE !== null;
    const displayScore = isPen ? proNE : prognose90;
    const scoreLabel = isPen ? 'n. Verl./Elfm.' : 'Prognose (90\')';
    const penNote = isPen
      ? `<div class="mc-pen">🎯 90': ${prognose90} → Verlängerung → Elfm.-Risiko: ${penPct}% → KI-Sieger: <strong>${winner}</strong></div>`
      : `<div class="ko-winner">🏆 KI-Sieger (90'): ${winner}</div>`;

    return `<div class="mcard ko-card" data-ko="1" data-teams="${t1.toLowerCase()} ${t2.toLowerCase()}">
  <div class="mc-head">
    <span class="mc-grp ko-badge">${datum} · ${zeit}</span>
    <span class="mc-venue">📍 ${venue}</span>
  </div>
  <div class="mc-body">
    <div class="mc-teams">
      <div class="mc-team"><div class="mc-flag">${f1}</div><div class="mc-name">${t1}</div></div>
      <div class="mc-score-box">
        <div class="mc-score">${displayScore}${isPen ? '' : ''}</div>
        <div class="mc-label">${scoreLabel}</div>
      </div>
      <div class="mc-team"><div class="mc-flag">${f2}</div><div class="mc-name">${t2}</div></div>
    </div>
    ${penNote}
    <div class="mc-metrics">
      <div class="mc-met"><span>90'-Erg.</span><b>${prognose90}</b></div>
      <div class="mc-met"><span>Elfm.-%</span><b>${isPen ? penPct+'%' : 'N/A'}</b></div>
      <div class="mc-met"><span>KI-Sieger</span><b>${winner}</b></div>
      <div class="mc-met"><span>Confidence</span><b style="color:${ccolor}">${conf}</b></div>
    </div>
    <div id="ko-result-${mid}" class="mc-result" style="display:none">
      <div class="mc-result-header">✅ Offizielles Ergebnis</div>
      <div class="mc-result-scores"><span class="lbl">Ergebnis:</span><span id="ko-score-${mid}">–</span></div>
      <div id="ko-delta-${mid}"></div>
    </div>
    <div class="mc-conf" style="color:${ccolor}">● Confidence: ${conf}</div>
  </div>
</div>`;
  }

  // ============================================================
  // SPIELDATEN
  // Format: [idx, datum, zeit, t1, f1, t2, f2, venue,
  //          prognose90, proNE (oder null), winner, penPct, conf]
  //
  // REGELN:
  //   - prognose90: immer exaktes 90'-Ergebnis (kann 1:1 / 0:0 sein)
  //   - proNE: wenn 90' unentschieden → Elfmeter-Ergebnis (z.B. "4:3 n.E.")
  //            wenn 90' entschieden → null
  //   - penPct: Wahrscheinlichkeit dass es zu Elfmeter kommt (falls proNE!=null)
  //             sonst 0
  //   - winner: immer klar ein Team
  // ============================================================

  // === SECHZEHNTELFINALE (Round of 32) ===
  // Basierend auf echten Gruppenständen (Stand 25.06.2026, Spieltag 3 läuft)
  // A1=Mexiko A2=SüdAfrika B1=Schweiz B2=Kanada C1=Brasilien C2=Marokko
  // D1=USA D2=Australien E1=Deutschland E2=Elfenbeinküste F1=Niederlande F2=Japan
  // G1=Ägypten G2=Iran H1=Spanien H2=Uruguay I1=Frankreich I2=Norwegen
  // J1=Argentinien J2=Österreich K1=Kolumbien K2=Portugal L1=England L2=Kroatien
  const r32 = [
    // Match 1: A1 Mexiko vs B2 Kanada
    [1,'28.06.26','21:00','Mexiko','🇲🇽','Kanada','🇨🇦','SoFi Stadium, Los Angeles',
     '2:1', null, 'Mexiko', 0, 'Hoch'],
    // Match 2: C1 Brasilien vs D2 Australien
    [2,'29.06.26','19:00','Brasilien','🇧🇷','Australien','🇦🇺','AT&T Stadium, Dallas',
     '2:0', null, 'Brasilien', 0, 'Sehr hoch'],
    // Match 3: E1 Deutschland vs F2 Japan
    [3,'29.06.26','22:30','Deutschland','🇩🇪','Japan','🇯🇵','Arrowhead Stadium, Kansas City',
     '2:1', null, 'Deutschland', 0, 'Hoch'],
    // Match 4: G1 Ägypten vs H2 Uruguay
    [4,'30.06.26','03:00','Ägypten','🇪🇬','Uruguay','🇺🇾','MetLife Stadium, New York',
     '1:1', '3:4 n.E.', 'Uruguay', 36, 'Mittel'],
    // Match 5: I1 Frankreich vs J2 Österreich
    [5,'30.06.26','19:00','Frankreich','🇫🇷','Österreich','🇦🇹',"Levi's Stadium, Santa Clara",
     '2:0', null, 'Frankreich', 0, 'Sehr hoch'],
    // Match 6: K1 Kolumbien vs L2 Kroatien
    [6,'30.06.26','23:00','Kolumbien','🇨🇴','Kroatien','🇭🇷','NRG Stadium, Houston',
     '2:1', null, 'Kolumbien', 0, 'Hoch'],
    // Match 7: D1 USA vs C2 Marokko
    [7,'01.07.26','03:00','USA','🇺🇸','Marokko','🇲🇦','Rose Bowl, Los Angeles',
     '2:1', null, 'USA', 0, 'Hoch'],
    // Match 8: F1 Niederlande vs E2 Elfenbeinküste
    [8,'01.07.26','18:00','Niederlande','🇳🇱','Elfenbeinküste','🇨🇮','Hard Rock Stadium, Miami',
     '2:0', null, 'Niederlande', 0, 'Hoch'],
    // Match 9: H1 Spanien vs G2 Iran
    [9,'01.07.26','22:00','Spanien','🇪🇸','Iran','🇮🇷','Mercedes-Benz Stadium, Atlanta',
     '3:0', null, 'Spanien', 0, 'Sehr hoch'],
    // Match 10: L1 England vs K2 Portugal
    // Sehr ausgeglichen – 90' Unentschieden möglich → Elfmeter
    [10,'02.07.26','02:00','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal','🇵🇹','BC Place, Vancouver',
     '1:1', '4:3 n.E.', 'England', 38, 'Mittel'],
    // Match 11: J1 Argentinien vs I2 Norwegen
    [11,'02.07.26','21:00','Argentinien','🇦🇷','Norwegen','🇳🇴','Gillette Stadium, Boston',
     '2:1', null, 'Argentinien', 0, 'Hoch'],
    // Match 12: B1 Schweiz vs A2 Südafrika
    [12,'03.07.26','01:00','Schweiz','🇨🇭','Südafrika','🇿🇦','Estadio Azteca, Mexico City',
     '2:0', null, 'Schweiz', 0, 'Sehr hoch'],
    // Match 13-16: Beste Drittplatzierte (4 Slots) – werden nach Spieltag 3 fixiert
    // Vorläufige Prognosen auf Basis wahrscheinlichster Best-3rd-Teams
    // Slot 1: best 3rd (wahrscheinlich Bosnien oder Senegal) vs F1-Bereich-Gegner
    [13,'03.07.26','05:00','Bosnien','🇧🇦','Schweden','🇸🇪','Lumen Field, Seattle',
     '1:1', '5:4 n.E.', 'Schweden', 32, 'Mittel'],
    [14,'03.07.26','20:00','Kroatien','🇭🇷','Südkorea','🇰🇷','BMO Field, Toronto',
     '1:1', '4:3 n.E.', 'Kroatien', 33, 'Mittel'],
    [15,'04.07.26','00:00','Argentinien','🇦🇷','Schweden','🇸🇪','Cotton Bowl, Dallas',
     '2:0', null, 'Argentinien', 0, 'Hoch'],
    [16,'04.07.26','03:30','Kolumbien','🇨🇴','Senegal','🇸🇳','Allegiant Stadium, Las Vegas',
     '2:1', null, 'Kolumbien', 0, 'Hoch'],
  ];

  // === ACHTELFINALE ===
  const af = [
    // Mexiko vs Uruguay (Sieger R32-4)
    [101,'04.07.26','19:00','Mexiko','🇲🇽','Uruguay','🇺🇾','MetLife Stadium, New York/NJ',
     '2:1', null, 'Mexiko', 0, 'Hoch'],
    // Frankreich vs Kolumbien
    [102,'04.07.26','23:00','Frankreich','🇫🇷','Kolumbien','🇨🇴','Rose Bowl, Los Angeles',
     '2:1', null, 'Frankreich', 0, 'Hoch'],
    // Deutschland vs USA
    [103,'05.07.26','22:00','Deutschland','🇩🇪','USA','🇺🇸','AT&T Stadium, Dallas',
     '1:1', '5:4 n.E.', 'Deutschland', 35, 'Mittel'],
    // Brasilien vs Niederlande
    [104,'06.07.26','02:00','Brasilien','🇧🇷','Niederlande','🇳🇱','Hard Rock Stadium, Miami',
     '2:1', null, 'Brasilien', 0, 'Mittel'],
    // Spanien vs England
    [105,'06.07.26','21:00','Spanien','🇪🇸','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿','SoFi Stadium, Los Angeles',
     '1:1', '5:4 n.E.', 'Spanien', 38, 'Mittel'],
    // Argentinien vs Schweiz
    [106,'07.07.26','02:00','Argentinien','🇦🇷','Schweiz','🇨🇭',"Levi's Stadium, Santa Clara",
     '2:0', null, 'Argentinien', 0, 'Hoch'],
    // Norwegen vs Schweden (Nordderby)
    [107,'07.07.26','18:00','Norwegen','🇳🇴','Schweden','🇸🇪','Arrowhead Stadium, Kansas City',
     '1:2', null, 'Schweden', 0, 'Mittel'],
    // Mexiko vs Frankreich – Mexiko überraschend ausgeschieden?
    // KI-Prognose: Frankreich dominiert
    [108,'07.07.26','22:00','Frankreich','🇫🇷','Mexiko','🇲🇽','NRG Stadium, Houston',
     '2:0', null, 'Frankreich', 0, 'Sehr hoch'],
  ];

  // === VIERTELFINALE ===
  const vf = [
    // Frankreich vs Deutschland
    [201,'09.07.26','22:00','Frankreich','🇫🇷','Deutschland','🇩🇪','MetLife Stadium, New York/NJ',
     '2:1', null, 'Frankreich', 0, 'Hoch'],
    // Brasilien vs Spanien
    [202,'10.07.26','21:00','Brasilien','🇧🇷','Spanien','🇪🇸','Rose Bowl, Los Angeles',
     '1:1', '5:3 n.E.', 'Brasilien', 40, 'Mittel'],
    // Argentinien vs Schweden
    [203,'11.07.26','23:00','Argentinien','🇦🇷','Schweden','🇸🇪','AT&T Stadium, Dallas',
     '2:0', null, 'Argentinien', 0, 'Hoch'],
    // Kolumbien vs Frankreich (zweites VF)
    [204,'12.07.26','03:00','Frankreich','🇫🇷','Kolumbien','🇨🇴','SoFi Stadium, Los Angeles',
     '1:0', null, 'Frankreich', 0, 'Mittel'],
  ];

  // === HALBFINALE ===
  const hf = [
    // Frankreich vs Argentinien
    [301,'14.07.26','21:00','Frankreich','🇫🇷','Argentinien','🇦🇷','MetLife Stadium, New York/NJ',
     '1:2', null, 'Argentinien', 0, 'Hoch'],
    // Brasilien vs Deutschland
    [302,'15.07.26','21:00','Brasilien','🇧🇷','Deutschland','🇩🇪','Rose Bowl, Los Angeles',
     '2:1', null, 'Brasilien', 0, 'Hoch'],
  ];

  // === FINALE + SPIEL UM PLATZ 3 ===
  const fin = [
    // Spiel um Platz 3: Frankreich vs Deutschland
    [402,'18.07.26','23:00','Frankreich','🇫🇷','Deutschland','🇩🇪','Rose Bowl, Los Angeles',
     '2:1', null, 'Frankreich', 0, 'Hoch'],
    // FINALE: Argentinien vs Brasilien
    [401,'19.07.26','21:00','Argentinien','🇦🇷','Brasilien','🇧🇷','MetLife Stadium, New York/NJ 🏆',
     '1:1', '4:3 n.E.', 'Argentinien', 42, 'Mittel'],
  ];

  function renderSection(matches) {
    return matches.map(m => koCard(...m)).join('\n');
  }

  const koHtml = `
<div class="section" id="tab-ko">
  <div class="ko-intro">
    <strong>⚡ KO-Runden Prognosen – WM 2026</strong><br>
    In K.O.-Runden gibt es <strong>kein Unentschieden</strong>. Bei Gleichstand nach 90' → Verlängerung → Elfmeterschießen.<br>
    Die KI-Prognose zeigt: 90'-Ergebnis + falls Elfer nötig das Elfmeter-Ergebnis (z.B. 4:3 n.E.).<br>
    <strong>Gruppensieger (Stand 25.06.26):</strong> A=🇲🇽Mexiko · B=🇨🇭Schweiz · C=🇧🇷Brasilien · D=🇺🇸USA · E=🇩🇪Deutschland · F=🇳🇱Niederlande · G=🇪🇬Ägypten · H=🇪🇸Spanien · I=🇫🇷Frankreich · J=🇦🇷Argentinien · K=🇨🇴Kolumbien · L=🏴󠁧󠁢󠁥󠁮󠁧󠁿England
  </div>
  <div class="ko-stat-row">
    <div class="ko-stat-box"><div class="val" id="ko-total">30</div><div class="lbl">KO-Spiele gesamt</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-correct">0</div><div class="lbl">Korrekte Tendenz</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-exact">0</div><div class="lbl">Exakt-Treffer</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-pts">0</div><div class="lbl">KO-Punkte</div></div>
  </div>

  <div class="ko-section-header">
    <div class="ko-round-badge r32">⚽ Sechzehntelfinale</div>
    <span class="ko-round-info">28.06. – 04.07.2026 · 16 Spiele</span>
  </div>
  <div class="mcards">${renderSection(r32)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge af">🥊 Achtelfinale</div>
    <span class="ko-round-info">04.07. – 07.07.2026 · 8 Spiele</span>
  </div>
  <div class="mcards">${renderSection(af)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge vf">⚡ Viertelfinale</div>
    <span class="ko-round-info">09.07. – 12.07.2026 · 4 Spiele</span>
  </div>
  <div class="mcards">${renderSection(vf)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge hf">🔥 Halbfinale</div>
    <span class="ko-round-info">14.07. – 15.07.2026 · 2 Spiele</span>
  </div>
  <div class="mcards">${renderSection(hf)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge finale">🏆 Finale + Spiel um Platz 3</div>
    <span class="ko-round-info">18.07. – 19.07.2026 · MetLife Stadium &amp; Rose Bowl</span>
  </div>
  <div class="mcards">${renderSection(fin)}</div>
</div>`;

  // Section einfügen
  const wrap = document.querySelector('.wrap');
  if (wrap) {
    const tmp = document.createElement('div');
    tmp.innerHTML = koHtml;
    const koSection = tmp.firstElementChild;
    const footer = wrap.querySelector('.footer');
    footer ? wrap.insertBefore(koSection, footer) : wrap.appendChild(koSection);
  }

  // === ERGEBNISSE LADEN ===
  async function loadKOResults(data) {
    let koCorrect = 0, koExact = 0, koPts = 0;
    data.forEach(r => {
      if (r.status !== 'finished') return;
      const key = (r.teams || '').toLowerCase();
      document.querySelectorAll('.ko-card').forEach(card => {
        const ct = (card.dataset.teams || '').toLowerCase();
        const kp = key.split(' ');
        const k1 = kp[0], k2 = kp[kp.length - 1];
        if (!ct.includes(k1) || !ct.includes(k2)) return;
        const resDiv = card.querySelector('[id^="ko-result-"]');
        if (!resDiv) return;
        const mid = resDiv.id.replace('ko-result-', '');
        const scoreEl = document.getElementById('ko-score-' + mid);
        const deltaEl = document.getElementById('ko-delta-' + mid);
        if (!scoreEl) return;
        resDiv.style.display = 'block';
        scoreEl.textContent = r.home + ' : ' + r.away;
        const pred90El = card.querySelector('.mc-met b');
        if (pred90El && deltaEl) {
          const pred90 = pred90El.textContent.trim();
          const parts = pred90.split(':');
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const ph = parseInt(parts[0]), pa = parseInt(parts[1]);
            const ah = r.home, aa = r.away;
            const predWin = ph > pa ? 'H' : (ph < pa ? 'A' : 'D');
            const realWin = ah > aa ? 'H' : (ah < aa ? 'A' : 'D');
            let cls = 'bad', txt = '❌ Fehl-Tipp (+0 Pkt)', pts = 0;
            if (ph === ah && pa === aa) {
              cls = 'good'; txt = '✅ Exakt-Treffer! (+4 Pkt)'; pts = 4; koExact++; koCorrect++;
            } else if (predWin === realWin) {
              if (Math.abs(ph - pa) === Math.abs(ah - aa)) {
                cls = 'good'; txt = '✅ Tendenz+Diff korrekt (+3 Pkt)'; pts = 3; koCorrect++;
              } else {
                cls = 'mid'; txt = '👍 Tendenz korrekt (+2 Pkt)'; pts = 2; koCorrect++;
              }
            }
            koPts += pts;
            deltaEl.innerHTML = `<span class="mc-delta ${cls}">${txt}</span>`;
          }
        }
      });
    });
    const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('ko-correct', koCorrect);
    el('ko-exact', koExact);
    el('ko-pts', koPts);
  }

  // loadResults erweitern
  const _origLoad = window.loadResults;
  window.loadResults = async function() {
    if (_origLoad) await _origLoad();
    try {
      const res = await fetch('https://raw.githubusercontent.com/basecore/wm2026-tipp-dashboard/main/results.json?t=' + Date.now());
      const data = await res.json();
      loadKOResults(data);
    } catch (e) { console.warn('KO Results load failed', e); }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => window.loadResults && window.loadResults(), 800);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => window.loadResults && window.loadResults(), 800);
    });
  }

})();
