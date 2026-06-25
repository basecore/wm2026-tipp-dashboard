// WM 2026 KO-Runden Injector
// Basierend auf echten Gruppenständen aus results.json
// Gruppensieger: A=Mexiko B=Schweiz C=Brasilien D=USA E=Deutschland F=Niederlande G=Ägypten H=Spanien I=Frankreich J=Argentinien K=Kolumbien L=England

(function() {
  // === CSS EINFÜGEN ===
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
`;
  document.head.appendChild(style);

  // === NAV BUTTON EINFÜGEN ===
  const navrow = document.querySelector('.navrow');
  if (navrow) {
    const btn = document.createElement('button');
    btn.className = 'navbtn';
    btn.textContent = '⚡ K.O.-Runden';
    btn.onclick = function() { switchTab('ko', btn); };
    navrow.appendChild(btn);
  }

  // === KO SECTION HTML BAUEN ===
  function cc(c) {
    if (c==='Sehr hoch') return '#49d28c';
    if (c==='Hoch') return '#67a4ff';
    if (c==='Mittel') return '#f3b83b';
    return '#ff5d73';
  }

  function koCard(idx, datum, zeit, t1, f1, t2, f2, venue, prognose, penPct, penWinner, conf) {
    const ccolor = cc(conf);
    const penInt = parseInt(penPct);
    const penNote = penInt >= 15 ? `<div class="mc-pen">🎯 Elfmeter-Risiko: ${penPct}% → KI-Sieger: ${penWinner}</div>` : '';
    let winnerNote;
    if (prognose.includes('n.E.') || prognose === '❓:❓') {
      winnerNote = `⚡ Verlängerung/Elfmeter möglich → KI-Sieger: ${penWinner}`;
    } else {
      const p = prognose.split(':');
      winnerNote = (parseInt(p[0]) > parseInt(p[1])) ? `🏆 Prognose-Sieger: ${t1}` : `🏆 Prognose-Sieger: ${t2}`;
    }
    const mid = `ko${idx}`;
    return `<div class="mcard ko-card" data-ko="1" data-teams="${t1.toLowerCase()} ${t2.toLowerCase()}">
  <div class="mc-head">
    <span class="mc-grp ko-badge">${datum} · ${zeit}</span>
    <span class="mc-venue">📍 ${venue}</span>
  </div>
  <div class="mc-body">
    <div class="mc-teams">
      <div class="mc-team"><div class="mc-flag">${f1}</div><div class="mc-name">${t1}</div></div>
      <div class="mc-score-box"><div class="mc-score">${prognose}</div><div class="mc-label">KI-Prognose</div></div>
      <div class="mc-team"><div class="mc-flag">${f2}</div><div class="mc-name">${t2}</div></div>
    </div>
    <div class="ko-winner">${winnerNote}</div>
    ${penNote}
    <div class="mc-metrics">
      <div class="mc-met"><span>Pen-%</span><b>${penPct}%</b></div>
      <div class="mc-met"><span>KI-Sieger</span><b>${penWinner}</b></div>
      <div class="mc-met"><span>Confidence</span><b style="color:${ccolor}">${conf}</b></div>
      <div class="mc-met"><span>Phase</span><b>K.O.</b></div>
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

  // === SPIELDATEN ===
  const r32 = [
    [1,'28.06.26','21:00','Mexiko','🇲🇽','Kanada','🇨🇦','SoFi Stadium, Los Angeles (A1 vs B2)','2:1','28','Mexiko','Hoch'],
    [2,'29.06.26','19:00','Brasilien','🇧🇷','Australien','🇦🇺','AT&T Stadium, Dallas (C1 vs D2)','2:0','18','Brasilien','Sehr hoch'],
    [3,'29.06.26','22:30','Deutschland','🇩🇪','Japan','🇯🇵','Arrowhead Stadium, Kansas City (E1 vs F2)','2:1','22','Deutschland','Hoch'],
    [4,'30.06.26','03:00','Ägypten','🇪🇬','Uruguay','🇺🇾','MetLife Stadium, New York (G1 vs H2)','1:2','35','Uruguay','Mittel'],
    [5,'30.06.26','19:00','Frankreich','🇫🇷','Österreich','🇦🇹',"Levi's Stadium, Santa Clara (I1 vs J2)",'2:0','15','Frankreich','Sehr hoch'],
    [6,'30.06.26','23:00','Kolumbien','🇨🇴','Ghana','🇬🇭','NRG Stadium, Houston (K1 vs L2)','2:1','22','Kolumbien','Hoch'],
    [7,'01.07.26','03:00','USA','🇺🇸','Marokko','🇲🇦','Rose Bowl, Los Angeles (D1 vs C2)','2:1','25','USA','Hoch'],
    [8,'01.07.26','18:00','Niederlande','🇳🇱','Elfenbeinküste','🇨🇮','Hard Rock Stadium, Miami (F1 vs E2)','2:0','18','Niederlande','Hoch'],
    [9,'01.07.26','22:00','Spanien','🇪🇸','Iran','🇮🇷','Mercedes-Benz Stadium, Atlanta (H1 vs G2)','3:0','12','Spanien','Sehr hoch'],
    [10,'02.07.26','02:00','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal','🇵🇹','BC Place, Vancouver (L1 vs K2)','1:1 n.E.','38','England','Mittel'],
    [11,'02.07.26','21:00','Argentinien','🇦🇷','Norwegen','🇳🇴','Gillette Stadium, Boston (J1 vs I2)','2:1','22','Argentinien','Hoch'],
    [12,'03.07.26','01:00','Schweiz','🇨🇭','Südafrika','🇿🇦','Estadio Azteca, Mexico City (B1 vs A2)','2:0','15','Schweiz','Sehr hoch'],
    [13,'03.07.26','05:00','Bosnien-Herzegowina','🇧🇦','Schweden','🇸🇪','Lumen Field, Seattle (3rd-B vs 3rd-F)','1:2 n.E.','32','Schweden','Mittel'],
    [14,'03.07.26','20:00','Kroatien','🇭🇷','Südkorea','🇰🇷','BMO Field, Toronto (3rd-L vs 3rd-A)','1:1 n.E.','33','Kroatien','Mittel'],
    [15,'04.07.26','00:00','Argentinien','🇦🇷','Schweden','🇸🇪','Cotton Bowl, Dallas (J1 vs best-3rd)','2:0','18','Argentinien','Hoch'],
    [16,'04.07.26','03:30','Kolumbien','🇨🇴','Kroatien','🇭🇷','Allegiant Stadium, Las Vegas (K1 vs 3rd-L)','2:1','22','Kolumbien','Hoch'],
  ];
  const af = [
    [101,'04.07.26','19:00','Mexiko','🇲🇽','Uruguay','🇺🇾','MetLife Stadium, New York/NJ','2:1','25','Mexiko','Hoch'],
    [102,'04.07.26','23:00','Frankreich','🇫🇷','Kolumbien','🇨🇴','Rose Bowl, Los Angeles','2:1','20','Frankreich','Hoch'],
    [103,'05.07.26','22:00','Deutschland','🇩🇪','USA','🇺🇸','AT&T Stadium, Dallas','1:1 n.E.','35','Deutschland','Mittel'],
    [104,'06.07.26','02:00','Brasilien','🇧🇷','Niederlande','🇳🇱','Hard Rock Stadium, Miami','2:1','28','Brasilien','Mittel'],
    [105,'06.07.26','21:00','Spanien','🇪🇸','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿','SoFi Stadium, Los Angeles','1:1 n.E.','38','Spanien','Mittel'],
    [106,'07.07.26','02:00','Argentinien','🇦🇷','Schweiz','🇨🇭',"Levi's Stadium, Santa Clara",'2:0','18','Argentinien','Hoch'],
    [107,'07.07.26','18:00','Norwegen','🇳🇴','Schweden','🇸🇪','Arrowhead Stadium, Kansas City','1:2','22','Schweden','Mittel'],
    [108,'07.07.26','22:00','Mexiko','🇲🇽','Frankreich','🇫🇷','NRG Stadium, Houston','0:2','15','Frankreich','Sehr hoch'],
  ];
  const vf = [
    [201,'09.07.26','22:00','Frankreich','🇫🇷','Deutschland','🇩🇪','MetLife Stadium, New York/NJ','2:1','28','Frankreich','Hoch'],
    [202,'10.07.26','21:00','Brasilien','🇧🇷','Spanien','🇪🇸','Rose Bowl, Los Angeles','1:1 n.E.','40','Brasilien','Mittel'],
    [203,'11.07.26','23:00','Argentinien','🇦🇷','Schweden','🇸🇪','AT&T Stadium, Dallas','2:0','18','Argentinien','Hoch'],
    [204,'12.07.26','03:00','Frankreich','🇫🇷','Argentinien','🇦🇷','SoFi Stadium, Los Angeles','1:2','35','Argentinien','Mittel'],
  ];
  const hf = [
    [301,'14.07.26','21:00','Frankreich','🇫🇷','Argentinien','🇦🇷','MetLife Stadium, New York/NJ','1:2','35','Argentinien','Hoch'],
    [302,'15.07.26','21:00','Brasilien','🇧🇷','Deutschland','🇩🇪','Rose Bowl, Los Angeles','2:1','28','Brasilien','Hoch'],
  ];
  const fin = [
    [401,'19.07.26','21:00','Argentinien','🇦🇷','Brasilien','🇧🇷','MetLife Stadium, New York/NJ 🏆 FINALE','1:0 n.E.','42','Argentinien','Mittel'],
    [402,'18.07.26','23:00','Frankreich','🇫🇷','Deutschland','🇩🇪','Rose Bowl, Los Angeles (3. Platz)','2:1','25','Frankreich','Hoch'],
  ];

  function renderSection(matches) {
    return matches.map(m => koCard(...m)).join('\n');
  }

  const koHtml = `
<div class="section" id="tab-ko">
  <div class="ko-intro">
    <strong>⚡ KO-Runden Prognosen – WM 2026</strong><br>
    Basierend auf echten Gruppenständen (results.json). Kein Unentschieden in K.O. → bei Gleichstand Elfmeter.<br>
    <strong>Gruppensieger:</strong> A=🇲🇽Mexiko · B=🇨🇭Schweiz · C=🇧🇷Brasilien · D=🇺🇸USA · E=🇩🇪Deutschland · F=🇳🇱Niederlande · G=🇪🇮GÄgypten · H=🇪🇸Spanien · I=🇫🇷Frankreich · J=🇦🇷Argentinien · K=🇨🇴Kolumbien · L=🏴󠁧󠁢󠁥󠁮󠁧󠁿England<br>
    <strong>Beste 4 Drittplatzierte (KO):</strong> 🇧🇦Bosnien (4 Pts) · 🇸🇪Schweden (3 Pts) · 🇭🇷Kroatien (3 Pts) · 🇰🇷Südkorea (3 Pts)
  </div>
  <div class="ko-stat-row">
    <div class="ko-stat-box"><div class="val" id="ko-total">30</div><div class="lbl">KO-Spiele gesamt</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-correct">0</div><div class="lbl">Korrekte Tendenz</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-exact">0</div><div class="lbl">Exakt-Treffer</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-pts">0</div><div class="lbl">KO-Punkte</div></div>
  </div>

  <div class="ko-section-header">
    <div class="ko-round-badge r32">⚽ Sechzehntelfinale</div>
    <span class="ko-round-info">28.06. – 04.07.2026 · 16 Spiele · Live-Ergebnisse via results.json</span>
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

  // Section in DOM einfügen (vor .footer oder am Ende von .wrap)
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
        const predEl = card.querySelector('.mc-score');
        if (predEl && deltaEl) {
          const predRaw = predEl.textContent.trim().replace(' n.E.', '');
          const parts = predRaw.split(':');
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const ph = parseInt(parts[0]), pa = parseInt(parts[1]);
            const ah = r.home, aa = r.away;
            const predWin = ph > pa ? 'H' : (ph < pa ? 'A' : 'D');
            const realWin = ah > aa ? 'H' : (ah < aa ? 'A' : 'D');
            let cls = 'bad', txt = '❌ Fehl-Tipp (+0 Pkt)', pts = 0;
            if (ph === ah && pa === aa) {
              cls = 'good'; txt = '✅ Exakt-Treffer! (+4 Pkt)'; pts = 4; koExact++; koCorrect++;
            } else if (predWin === realWin && predWin !== 'D') {
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

  // Globale loadResults Funktion erweitern
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
