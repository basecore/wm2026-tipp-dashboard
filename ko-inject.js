// ============================================================
// ko-inject.js  v4  –  WM 2026 KO-Runden Injector
// Öffnet einen neuen Tab "⚡ K.O.-Runden" mit identischer
// Kartenstruktur wie die Gruppenphase (Spielplan-Tab).
//
// KERNREGELN:
//  1) Keine Unentschieden in K.O. → Prognose zeigt IMMER
//     den Sieger. Bei voraussichtlichem 90'-Remis wird das
//     Elfmeter-Ergebnis (z.B. "4:3 n.E.") angezeigt.
//  2) Punkte werden NUR vergeben, wenn die tatsächlich
//     spielenden Teams mit der KI-Prognose übereinstimmen.
//     Stimmen Teams nicht überein → Karte grau, 0 Punkte,
//     aber offizielles Ergebnis wird trotzdem angezeigt.
//  3) Statistik-Tab wird um KO-Daten erweitert.
//  4) Prognose-Vergleich (KI-Teams vs. echte Teams) wird
//     im Statistik-Tab als eigene Sektion dargestellt.
//
// v4 Update 28.06.2026:
//  Gruppensieger/-zweite aktualisiert nach Spieltag 3:
//  G1=Belgien (war Ägypten), G2=Ägypten (war Iran),
//  H2=Cape Verde (war Uruguay)
// ============================================================

(function () {
  'use strict';

  // ── CSS ──────────────────────────────────────────────────
  var css = `
.ko-badge{background:color-mix(in srgb,var(--violet) 20%,transparent);color:var(--violet);border:1px solid color-mix(in srgb,var(--violet) 35%,var(--line));font-size:11px;font-weight:800;padding:4px 8px;border-radius:999px}
.ko-card{border-color:color-mix(in srgb,var(--violet) 25%,var(--line))}
.ko-card:hover{border-color:var(--violet);box-shadow:0 8px 32px rgba(179,139,255,.2)}
.ko-card.team-mismatch{opacity:.6;border-color:var(--line)!important;border-style:dashed!important}
.ko-card.team-mismatch .mc-score{color:var(--muted)!important}
.ko-mismatch-note{font-size:11px;color:var(--muted);padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px dashed var(--line);margin-bottom:8px}
.ko-section-header{display:flex;align-items:center;gap:12px;margin:24px 0 12px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.ko-round-badge{padding:6px 14px;border-radius:999px;font-size:13px;font-weight:900;letter-spacing:.04em;display:inline-block}
.ko-round-badge.r32{background:color-mix(in srgb,#f3b83b 18%,transparent);color:#f3b83b;border:1px solid color-mix(in srgb,#f3b83b 35%,var(--line))}
.ko-round-badge.af{background:color-mix(in srgb,#67a4ff 18%,transparent);color:#67a4ff;border:1px solid color-mix(in srgb,#67a4ff 35%,var(--line))}
.ko-round-badge.vf{background:color-mix(in srgb,#49d28c 18%,transparent);color:#49d28c;border:1px solid color-mix(in srgb,#49d28c 35%,var(--line))}
.ko-round-badge.hf{background:color-mix(in srgb,#ff5d73 18%,transparent);color:#ff5d73;border:1px solid color-mix(in srgb,#ff5d73 35%,var(--line))}
.ko-round-badge.finale{background:linear-gradient(135deg,rgba(243,184,59,.3),rgba(179,139,255,.2));color:#f3b83b;border:2px solid #f3b83b;font-size:14px}
.ko-intro{background:linear-gradient(135deg,rgba(179,139,255,.08),rgba(103,164,255,.06));border:1px solid color-mix(in srgb,var(--violet) 25%,var(--line));border-radius:14px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:var(--muted);line-height:1.6}
.ko-intro strong{color:var(--text)}
.ko-stat-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px}
.ko-stat-box{flex:1;min-width:130px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:12px;text-align:center}
.ko-stat-box .val{font-size:22px;font-weight:900;color:var(--gold)}
.ko-stat-box .lbl{font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:2px}
.ko-pen-info{font-size:11px;color:var(--violet);padding:5px 10px;border-radius:8px;background:rgba(179,139,255,.08);border-left:3px solid var(--violet);margin-bottom:8px}
.ko-winner-info{font-size:12px;color:var(--gold);padding:6px 10px;border-radius:8px;background:rgba(243,184,59,.07);border-left:3px solid var(--gold);margin-bottom:8px;font-weight:700}
.mc-result-ko{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
.mc-result-ko .rh{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:800;margin-bottom:6px}
.mc-result-ko .rs{font-size:14px;font-weight:700;margin-bottom:4px}
.mc-delta{font-size:12px;font-weight:800;padding:3px 10px;border-radius:999px;display:inline-block;margin-top:2px}
.mc-delta.good{background:rgba(73,210,140,.15);color:var(--green)}
.mc-delta.mid{background:rgba(243,184,59,.12);color:var(--gold)}
.mc-delta.bad{background:rgba(255,93,115,.12);color:var(--red)}
.mc-delta.gray{background:rgba(168,180,207,.1);color:var(--muted)}
/* KO Vergleichstabelle im Statistik-Tab */
.ko-compare-section{margin-top:32px;padding-top:24px;border-top:1px solid var(--line)}
.ko-compare-section h3{font-size:16px;font-weight:900;margin-bottom:14px;color:var(--text)}
.ko-ctbl{width:100%;border-collapse:collapse;font-size:12px}
.ko-ctbl th{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;padding:8px 6px;border-bottom:1px solid var(--line);text-align:left}
.ko-ctbl td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.ko-ctbl .match-ok td:first-child{border-left:3px solid var(--green)}
.ko-ctbl .match-miss td:first-child{border-left:3px solid var(--red)}
.ko-ctbl .match-open td:first-child{border-left:3px solid var(--muted)}
.team-ok{color:var(--green);font-weight:700}
.team-wrong{color:var(--red);font-weight:700}
.team-open{color:var(--muted)}
`;
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── ALIAS-NORM ───────────────────────────────────────────
  var ALIAS = {
    'elfenbeink.':'elfenbeinküste','elfenbeinküste':'elfenbeinküste',
    'bosnien-h.':'bosnien-herzegowina','bosnien-herzegowina':'bosnien-herzegowina',
    'saudi-arab.':'saudi-arabien','saudi-arabien':'saudi-arabien',
    'kap verde':'cape verde islands','cape verde islands':'cape verde islands',
    'cape verde':'cape verde islands','dr kongo':'dr kongo',
    'curaçao':'curaçao','ägypten':'ägypten','österreich':'österreich',
    'usa':'usa','nordmazedonien':'nordmazedonien',
  };
  function norm(s){ var t=s.trim().toLowerCase(); return ALIAS[t]||t; }

  // ── KICKTIPP-PUNKTE ──────────────────────────────────────
  function ktPoints(pA,pB,eA,eB){
    var pW=pA>pB?'A':(pA<pB?'B':'U');
    var eW=eA>eB?'A':(eA<eB?'B':'U');
    if(pW!==eW) return {pts:0,cat:'miss'};
    if(pA===eA&&pB===eB) return {pts:4,cat:'exact'};
    if(eW!=='U'&&(pA-pB)===(eA-eB)) return {pts:3,cat:'tordiff'};
    return {pts:eW==='U'?3:2,cat:'tendenz'};
  }

  var BADGE={
    exact  :{col:'var(--green)',bg:'rgba(73,210,140,.2)',  lbl:'✅ 4 Pkt Exakt'},
    tordiff:{col:'var(--blue)', bg:'rgba(103,164,255,.2)',lbl:'🎯 3 Pkt Tordiff.'},
    tendenz:{col:'var(--gold)', bg:'rgba(243,184,59,.2)', lbl:'🟢 2–3 Pkt Tendenz'},
    miss   :{col:'var(--red)',  bg:'rgba(255,93,115,.15)',lbl:'❌ 0 Pkt Fehler'},
    mismatch:{col:'var(--muted)',bg:'rgba(168,180,207,.08)',lbl:'⚠️ Falsche Teams – 0 Pkt'},
  };

  // ── CONFIDENCE-FARBE ─────────────────────────────────────
  function cc(c){
    if(c==='Sehr hoch') return '#49d28c';
    if(c==='Hoch')      return '#67a4ff';
    if(c==='Mittel')    return '#f3b83b';
    return '#ff5d73';
  }

  // ── KARTEN-BUILDER ───────────────────────────────────────
  function koCard(idx,datum,zeit,t1,f1,t2,f2,rank1,rank2,venue,hoehe,temp,
                  prog90,proNE,winner,winPct,drawPct,losePct,
                  xg1,xg2,over25,btts,penPct,top3scores,note,conf,runde){
    var mid='ko'+idx;
    var isPen=(proNE!==null);
    var displayScore=isPen?proNE:prog90;
    var scoreLabel=isPen?'n. Verl./Elfm.':"Prognose (90')";
    var ccolor=cc(conf);
    var dataTeams=norm(t1)+'|'+norm(t2);
    var dataProg=prog90;

    var hoeheTxt=hoehe>0?hoehe+'m':'<10m';
    var tempNote=temp>=30?'🌡️ '+temp+'°C → xG −10%':temp<=5?'🥶 '+temp+'°C → xG −5%':'🌡️ '+temp+'°C';
    var hoehNote=hoehe>=2000?'⛰️ '+hoehe+'m → xG Heim +0.20':hoehe>=500?'⛰️ '+hoehe+'m → xG Heim +0.15':'';
    var envNote=[hoehNote,note].filter(Boolean).join(' · ');
    if(!envNote) envNote='Normale Bedingungen';

    var penInfo=isPen
      ? `<div class="ko-pen-info">🎯 90': ${prog90} → Verlängerung wahrscheinlich → Elfm.-Risiko: <strong>${penPct}%</strong> → KI-Sieger nach Elfm.: <strong>${winner}</strong></div>`
      : `<div class="ko-winner-info">🏆 KI-Sieger (90'): ${winner} (${winPct}%)</div>`;

    var scPills=top3scores.map(function(s){
      return '<span class="sc-pill">'+s[0]+' ('+s[1]+')</span>';
    }).join('');

    return `<div class="mcard ko-card"
  data-group="ko" data-ko="1" data-round="${runde}"
  data-teams="${dataTeams}" data-prog="${dataProg}"
  data-prog90="${prog90}" data-prone="${proNE||''}"
  data-winner="${norm(winner)}">
  <div class="mc-head">
    <span class="mc-grp ko-badge">${runde}</span>
    <span class="mc-date">${datum} · ${zeit}</span>
    <span class="mc-venue">📍 ${venue} · ${hoeheTxt} · ${temp}°C</span>
  </div>
  <div class="mc-body">
    <div class="mc-teams">
      <div class="mc-team">
        <div class="mc-flag">${f1}</div>
        <div class="mc-name">${t1}</div>
        <div class="mc-rank">FIFA #${rank1}</div>
      </div>
      <div class="mc-score-box">
        <div class="mc-score">${displayScore}</div>
        <div class="mc-label">${scoreLabel}</div>
      </div>
      <div class="mc-team">
        <div class="mc-flag">${f2}</div>
        <div class="mc-name">${t2}</div>
        <div class="mc-rank">FIFA #${rank2}</div>
      </div>
    </div>
    <div class="mc-bar-wrap">
      <span class="mc-pct" style="color:#49d28c">${winPct}%</span>
      <div class="mc-bar">
        <div class="mc-bh" style="width:${winPct}%"></div>
        <div class="mc-bd" style="width:${drawPct}%"></div>
        <div class="mc-ba" style="width:${losePct}%"></div>
      </div>
      <span class="mc-pct" style="color:#ff5d73">${losePct}%</span>
    </div>
    <div class="mc-bar-labels">
      <span style="color:#49d28c">${t1}</span>
      <span>Unentsch. (90') ${drawPct}%</span>
      <span style="color:#ff5d73">${t2}</span>
    </div>
    <div class="mc-metrics">
      <div class="mc-met"><span>xG ${t1.split(' ')[0]}</span><b>${xg1}</b></div>
      <div class="mc-met"><span>xG ${t2.split(' ')[0]}</span><b>${xg2}</b></div>
      <div class="mc-met"><span>Over 2.5</span><b>${over25}%</b></div>
      <div class="mc-met"><span>BTTS Ja</span><b>${btts}%</b></div>
    </div>
    ${penInfo}
    <div class="mc-scores">
      <div class="mc-sc-label">Top-3 Exact Scores (Poisson)</div>
      <div class="mc-sc-list">${scPills}</div>
    </div>
    <div class="mc-note">${envNote}</div>
    <div id="ko-result-${mid}" class="mc-result-ko" style="display:none">
      <div class="rh">✅ Offizielles Ergebnis</div>
      <div class="rs" id="ko-score-${mid}">–</div>
      <div id="ko-delta-${mid}"></div>
    </div>
    <div class="mc-conf" style="color:${ccolor}">● Confidence: ${conf}</div>
  </div>
</div>`;
  }

  // ── SPIELDATEN ───────────────────────────────────────────
  // Gruppensieger Stand 28.06.2026 (nach Spieltag 3, alle Gruppen abgeschlossen):
  // A1=Mexiko      A2=Südafrika
  // B1=Schweiz     B2=Kanada
  // C1=Brasilien   C2=Marokko
  // D1=USA         D2=Australien
  // E1=Deutschland E2=Elfenbeinküste
  // F1=Niederlande F2=Japan
  // G1=Belgien     G2=Ägypten      ← geändert (war Ägypten/Iran)
  // H1=Spanien     H2=Cape Verde   ← geändert (war Uruguay)
  // I1=Frankreich  I2=Norwegen
  // J1=Argentinien J2=Österreich
  // K1=Kolumbien   K2=Portugal
  // L1=England     L2=Kroatien

  var R32 = [
    // 1: A1 Mexiko vs B2 Kanada
    [1,'28.06.26','21:00','Mexiko','🇲🇽','Kanada','🇨🇦',16,47,
     'SoFi Stadium, Los Angeles',71,27,'2:1',null,'Mexiko',
     52,24,24,1.82,1.44,57.0,58.2,0,
     [['1:0','10.2%'],['2:1','9.8%'],['1:1','9.5%']],'','Hoch','A Sechzehntelfinale'],
    // 2: C1 Brasilien vs D2 Australien
    [2,'29.06.26','19:00','Brasilien','🇧🇷','Australien','🇦🇺',5,24,
     'AT&T Stadium, Dallas',145,32,'2:0',null,'Brasilien',
     58,22,20,2.05,1.18,61.0,57.0,0,
     [['2:0','12.1%'],['1:0','10.3%'],['2:1','9.8%']],'🌡️ 32°C → xG beider Teams −10%','Sehr hoch','A Sechzehntelfinale'],
    // 3: E1 Deutschland vs F2 Japan
    [3,'29.06.26','22:30','Deutschland','🇩🇪','Japan','🇯🇵',13,17,
     'Arrowhead Stadium, Kansas City',271,29,'2:1',null,'Deutschland',
     48,23,29,1.88,1.66,66.0,66.5,0,
     [['1:1','9.7%'],['2:1','9.2%'],['1:2','7.8%']],'','Hoch','A Sechzehntelfinale'],
    // 4: G1 Belgien vs H2 Cape Verde  ← AKTUALISIERT
    [4,'30.06.26','03:00','Belgien','🇧🇪','Cape Verde','🇨🇻',7,75,
     'MetLife Stadium, New York/NJ',2,26,'3:0',null,'Belgien',
     68,18,14,2.40,0.95,65.0,58.0,0,
     [['2:0','14.2%'],['3:0','12.5%'],['3:1','9.0%']],'','Sehr hoch','A Sechzehntelfinale'],
    // 5: I1 Frankreich vs J2 Österreich
    [5,'30.06.26','19:00','Frankreich','🇫🇷','Österreich','🇦🇹',2,26,
     "Levi's Stadium, Santa Clara",7,24,'2:0',null,'Frankreich',
     57,22,21,2.10,1.12,62.0,58.0,0,
     [['2:0','13.2%'],['1:0','10.8%'],['2:1','10.1%']],'','Sehr hoch','A Sechzehntelfinale'],
    // 6: K1 Kolumbien vs L2 Kroatien
    [6,'30.06.26','23:00','Kolumbien','🇨🇴','Kroatien','🇭🇷',9,10,
     'NRG Stadium, Houston',15,33,'2:1',null,'Kolumbien',
     45,24,31,1.75,1.55,63.0,63.5,0,
     [['1:1','10.2%'],['2:1','9.5%'],['1:2','8.4%']],'🌡️ 33°C → xG beider Teams −10%','Hoch','A Sechzehntelfinale'],
    // 7: D1 USA vs C2 Marokko
    [7,'01.07.26','03:00','USA','🇺🇸','Marokko','🇲🇦',11,14,
     'Rose Bowl, Los Angeles',88,27,'2:1',null,'USA',
     49,23,28,1.91,1.68,65.5,66.0,0,
     [['1:1','10.1%'],['2:1','9.4%'],['1:2','8.5%']],'','Hoch','A Sechzehntelfinale'],
    // 8: F1 Niederlande vs E2 Elfenbeinküste
    [8,'01.07.26','18:00','Niederlande','🇳🇱','Elfenbeinküste','🇨🇮',6,49,
     'Hard Rock Stadium, Miami',4,30,'2:0',null,'Niederlande',
     53,23,24,1.96,1.32,60.5,58.0,0,
     [['2:0','11.8%'],['1:0','10.2%'],['2:1','9.6%']],'🌡️ 30°C → xG −5%','Hoch','A Sechzehntelfinale'],
    // 9: H1 Spanien vs G2 Ägypten  ← AKTUALISIERT (war Iran)
    [9,'01.07.26','22:00','Spanien','🇪🇸','Ägypten','🇪🇬',2,34,
     'Mercedes-Benz Stadium, Atlanta',320,29,'3:0',null,'Spanien',
     65,20,15,2.35,1.05,70.0,62.0,0,
     [['2:0','14.0%'],['3:0','11.5%'],['3:1','8.8%']],'','Sehr hoch','A Sechzehntelfinale'],
    // 10: L1 England vs K2 Portugal – ELFMETER
    [10,'02.07.26','02:00','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal','🇵🇹',5,8,
     'BC Place, Vancouver',4,19,'1:1','4:3 n.E.','England',
     38,24,38,1.72,1.72,64.0,65.0,38,
     [['1:1','10.8%'],['1:0','9.0%'],['0:1','8.8%']],'','Mittel','A Sechzehntelfinale'],
    // 11: J1 Argentinien vs I2 Norwegen
    [11,'02.07.26','21:00','Argentinien','🇦🇷','Norwegen','🇳🇴',1,27,
     'Gillette Stadium, Boston',4,23,'2:1',null,'Argentinien',
     52,23,25,1.98,1.58,66.0,66.5,0,
     [['2:1','10.2%'],['1:0','8.5%'],['3:1','7.8%']],'','Hoch','A Sechzehntelfinale'],
    // 12: B1 Schweiz vs A2 Südafrika
    [12,'03.07.26','01:00','Schweiz','🇨🇭','Südafrika','🇿🇦',19,62,
     'Estadio Azteca, Mexico City',2300,31,'2:0',null,'Schweiz',
     51,24,25,1.72,1.12,56.0,54.0,0,
     [['2:0','11.5%'],['1:0','9.8%'],['2:1','9.0%']],'⛰️ 2300m → Heim xG +0.20 · 🌡️ 31°C','Sehr hoch','A Sechzehntelfinale'],
    // 13: Beste Drittplatzierte
    [13,'03.07.26','05:00','Bosnien','🇧🇦','Schweden','🇸🇪',55,26,
     'Lumen Field, Seattle',0,18,'1:1','5:4 n.E.','Schweden',
     38,25,37,1.52,1.55,57.0,58.0,32,
     [['1:1','11.2%'],['1:0','8.8%'],['0:1','8.6%']],'','Mittel','A Sechzehntelfinale'],
    // 14: Beste Drittplatzierte
    [14,'03.07.26','20:00','Kroatien','🇭🇷','Südkorea','🇰🇷',10,22,
     'BMO Field, Toronto',76,22,'1:1','4:3 n.E.','Kroatien',
     40,24,36,1.62,1.55,60.0,61.0,33,
     [['1:1','11.0%'],['1:0','9.0%'],['0:1','8.5%']],'','Mittel','A Sechzehntelfinale'],
    // 15: Beste Drittplatzierte
    [15,'04.07.26','00:00','Argentinien','🇦🇷','Schweden','🇸🇪',1,26,
     'Cotton Bowl, Dallas',145,32,'2:0',null,'Argentinien',
     55,22,23,2.05,1.35,62.0,59.0,0,
     [['2:0','12.8%'],['1:0','10.5%'],['2:1','9.8%']],'🌡️ 32°C → xG −10%','Hoch','A Sechzehntelfinale'],
    // 16: Beste Drittplatzierte
    [16,'04.07.26','03:30','Kolumbien','🇨🇴','Senegal','🇸🇳',9,41,
     'Allegiant Stadium, Las Vegas',621,34,'2:1',null,'Kolumbien',
     48,23,29,1.84,1.48,62.0,62.5,0,
     [['2:1','10.5%'],['1:0','9.2%'],['2:0','8.8%']],'⛰️ 621m · 🌡️ 34°C → xG −10%','Hoch','A Sechzehntelfinale'],
  ];

  var AF = [
    // 101: Mexiko vs Cape Verde (Sieger R32-4)  ← AKTUALISIERT (war Uruguay)
    [101,'04.07.26','19:00','Mexiko','🇲🇽','Cape Verde','🇨🇻',16,75,
     'MetLife Stadium, New York/NJ',2,26,'3:0',null,'Mexiko',
     68,18,14,2.30,0.92,64.0,57.0,0,
     [['2:0','14.5%'],['3:0','12.0%'],['3:1','9.2%']],'','Sehr hoch','B Achtelfinale'],
    // 102: Frankreich vs Kolumbien
    [102,'04.07.26','23:00','Frankreich','🇫🇷','Kolumbien','🇨🇴',2,9,
     'Rose Bowl, Los Angeles',88,27,'2:1',null,'Frankreich',
     48,23,29,1.95,1.72,67.5,67.0,0,
     [['2:1','10.1%'],['1:1','9.8%'],['2:0','9.2%']],'','Hoch','B Achtelfinale'],
    // 103: Deutschland vs USA – ELFMETER
    [103,'05.07.26','22:00','Deutschland','🇩🇪','USA','🇺🇸',13,11,
     'AT&T Stadium, Dallas',145,32,'1:1','5:4 n.E.','Deutschland',
     42,24,34,1.75,1.65,63.0,64.0,35,
     [['1:1','10.5%'],['1:0','8.8%'],['0:1','8.2%']],'🌡️ 32°C → xG −10%','Mittel','B Achtelfinale'],
    // 104: Brasilien vs Niederlande
    [104,'06.07.26','02:00','Brasilien','🇧🇷','Niederlande','🇳🇱',5,6,
     'Hard Rock Stadium, Miami',4,30,'2:1',null,'Brasilien',
     44,23,33,1.92,1.78,68.0,68.5,0,
     [['2:1','10.0%'],['1:1','9.7%'],['1:0','8.5%']],'🌡️ 30°C → xG −5%','Mittel','B Achtelfinale'],
    // 105: Spanien vs England – ELFMETER
    [105,'06.07.26','21:00','Spanien','🇪🇸','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿',2,5,
     'SoFi Stadium, Los Angeles',71,27,'1:1','5:4 n.E.','Spanien',
     40,22,38,1.82,1.75,66.0,67.0,38,
     [['1:1','10.8%'],['1:0','9.0%'],['0:1','8.8%']],'','Mittel','B Achtelfinale'],
    // 106: Argentinien vs Schweiz
    [106,'07.07.26','02:00','Argentinien','🇦🇷','Schweiz','🇨🇭',1,19,
     "Levi's Stadium, Santa Clara",7,24,'2:0',null,'Argentinien',
     54,23,23,2.08,1.32,62.0,58.5,0,
     [['2:0','12.5%'],['1:0','10.2%'],['2:1','9.8%']],'','Hoch','B Achtelfinale'],
    // 107: Norwegen vs Schweden (Nordderby)
    [107,'07.07.26','18:00','Norwegen','🇳🇴','Schweden','🇸🇪',27,26,
     'Arrowhead Stadium, Kansas City',271,29,'1:2',null,'Schweden',
     36,25,39,1.55,1.68,60.0,62.0,0,
     [['1:1','10.8%'],['1:2','9.2%'],['0:1','8.8%']],'','Mittel','B Achtelfinale'],
    // 108: Belgien vs Frankreich  ← AKTUALISIERT (war Frankreich vs Mexiko)
    [108,'07.07.26','22:00','Belgien','🇧🇪','Frankreich','🇫🇷',7,2,
     'NRG Stadium, Houston',15,33,'1:2',null,'Frankreich',
     32,24,44,1.55,1.98,65.0,66.0,0,
     [['1:2','10.8%'],['0:1','9.5%'],['1:1','9.2%']],'🌡️ 33°C → xG beider Teams −10%','Hoch','B Achtelfinale'],
  ];

  var VF = [
    // 201: Frankreich vs Deutschland
    [201,'09.07.26','22:00','Frankreich','🇫🇷','Deutschland','🇩🇪',2,13,
     'MetLife Stadium, New York/NJ',2,27,'2:1',null,'Frankreich',
     46,23,31,1.92,1.78,67.0,67.5,0,
     [['2:1','10.2%'],['1:1','9.8%'],['1:0','8.8%']],'','Hoch','C Viertelfinale'],
    // 202: Brasilien vs Spanien – ELFMETER
    [202,'10.07.26','21:00','Brasilien','🇧🇷','Spanien','🇪🇸',5,2,
     'Rose Bowl, Los Angeles',88,27,'1:1','5:3 n.E.','Brasilien',
     38,24,38,1.78,1.78,63.0,65.0,40,
     [['1:1','10.8%'],['1:0','9.0%'],['0:1','9.0%']],'','Mittel','C Viertelfinale'],
    // 203: Argentinien vs Schweden
    [203,'11.07.26','23:00','Argentinien','🇦🇷','Schweden','🇸🇪',1,26,
     'AT&T Stadium, Dallas',145,32,'2:0',null,'Argentinien',
     55,22,23,2.12,1.38,63.0,60.0,0,
     [['2:0','13.0%'],['1:0','10.5%'],['2:1','9.8%']],'🌡️ 32°C → xG −10%','Hoch','C Viertelfinale'],
    // 204: Mexiko vs Kolumbien  ← AKTUALISIERT (war Frankreich vs Kolumbien)
    [204,'12.07.26','03:00','Mexiko','🇲🇽','Kolumbien','🇨🇴',16,9,
     'SoFi Stadium, Los Angeles',71,27,'1:2',null,'Kolumbien',
     38,24,38,1.62,1.75,63.0,63.5,0,
     [['1:2','10.5%'],['1:1','9.8%'],['0:1','9.2%']],'','Mittel','C Viertelfinale'],
  ];

  var HF = [
    // 301: Frankreich vs Argentinien
    [301,'14.07.26','21:00','Frankreich','🇫🇷','Argentinien','🇦🇷',2,1,
     'MetLife Stadium, New York/NJ',2,27,'1:2',null,'Argentinien',
     38,24,38,1.82,1.92,67.0,68.0,0,
     [['1:1','10.5%'],['1:2','9.8%'],['0:1','8.8%']],'','Hoch','D Halbfinale'],
    // 302: Brasilien vs Kolumbien  ← AKTUALISIERT (war Brasilien vs Deutschland)
    [302,'15.07.26','21:00','Brasilien','🇧🇷','Kolumbien','🇨🇴',5,9,
     'Rose Bowl, Los Angeles',88,27,'2:1',null,'Brasilien',
     48,24,28,1.98,1.68,65.0,65.5,0,
     [['2:1','10.8%'],['1:1','9.5%'],['1:0','9.0%']],'','Hoch','D Halbfinale'],
  ];

  var FIN = [
    // 402: Spiel um Platz 3: Frankreich vs Kolumbien  ← AKTUALISIERT (war vs Deutschland)
    [402,'18.07.26','23:00','Frankreich','🇫🇷','Kolumbien','🇨🇴',2,9,
     'Rose Bowl, Los Angeles',88,27,'2:1',null,'Frankreich',
     48,24,28,1.92,1.72,65.0,65.5,0,
     [['2:1','10.5%'],['1:0','9.8%'],['1:1','9.2%']],'','Hoch','E Spiel um Platz 3'],
    // 401: FINALE: Argentinien vs Brasilien – ELFMETER
    [401,'19.07.26','21:00','Argentinien','🇦🇷','Brasilien','🇧🇷',1,5,
     'MetLife Stadium, New York/NJ 🏆',2,27,'1:1','4:3 n.E.','Argentinien',
     42,24,34,1.78,1.72,63.0,65.0,42,
     [['1:1','11.0%'],['1:0','9.0%'],['0:1','8.8%']],'🏆 FINALE','Mittel','E Finale'],
  ];

  function renderSection(matches){
    return matches.map(function(m){ return koCard.apply(null,m); }).join('\n');
  }

  // ── KO-TAB HTML ──────────────────────────────────────────
  var koHtml = `
<div class="section" id="tab-ko">
  <div class="ko-intro">
    <strong>⚡ KO-Runden Prognosen – WM 2026</strong><br>
    Alle KO-Prognosen basieren auf der gleichen Analyse-Logik wie die Gruppenphase (xG-Modell, Poisson, Höhe, Temperatur, Taktik, Kader).<br>
    <strong>Punkte:</strong> Nur wenn die tatsächlich spielenden Teams mit der KI-Prognose übereinstimmen. Bei Teamabweichung → 0 Punkte, Ergebnis trotzdem sichtbar.<br>
    <strong>Gruppensieger (Stand 28.06.26):</strong> A=🇲🇽Mexiko · B=🇨🇭Schweiz · C=🇧🇷Brasilien · D=🇺🇸USA · E=🇩🇪Deutschland · F=🇳🇱Niederlande · G=🇧🇪Belgien · H=🇪🇸Spanien · I=🇫🇷Frankreich · J=🇦🇷Argentinien · K=🇨🇴Kolumbien · L=🏴󠁧󠁢󠁥󠁮󠁧󠁿England
  </div>
  <div class="ko-stat-row">
    <div class="ko-stat-box"><div class="val" id="ko-total">30</div><div class="lbl">KO-Spiele gesamt</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-correct">0</div><div class="lbl">Korrekte Tendenz</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-exact">0</div><div class="lbl">Exakt-Treffer</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-pts">0</div><div class="lbl">KO-Punkte</div></div>
    <div class="ko-stat-box"><div class="val" id="ko-team-hits">0/30</div><div class="lbl">Teams korrekt prog.</div></div>
  </div>

  <div class="ko-section-header">
    <div class="ko-round-badge r32">⚽ Sechzehntelfinale</div>
    <span class="ko-round-info">28.06. – 04.07.2026 · 16 Spiele</span>
  </div>
  <div class="mcards" id="ko-r32">${renderSection(R32)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge af">🥊 Achtelfinale</div>
    <span class="ko-round-info">04.07. – 07.07.2026 · 8 Spiele</span>
  </div>
  <div class="mcards" id="ko-af">${renderSection(AF)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge vf">⚡ Viertelfinale</div>
    <span class="ko-round-info">09.07. – 12.07.2026 · 4 Spiele</span>
  </div>
  <div class="mcards" id="ko-vf">${renderSection(VF)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge hf">🔥 Halbfinale</div>
    <span class="ko-round-info">14.07. – 15.07.2026 · 2 Spiele</span>
  </div>
  <div class="mcards" id="ko-hf">${renderSection(HF)}</div>

  <div class="ko-section-header" style="margin-top:32px">
    <div class="ko-round-badge finale">🏆 Finale + Spiel um Platz 3</div>
    <span class="ko-round-info">18.07. – 19.07.2026 · MetLife Stadium &amp; Rose Bowl</span>
  </div>
  <div class="mcards" id="ko-fin">${renderSection(FIN)}</div>
</div>`;

  // Section einfügen
  var wrap = document.querySelector('.wrap');
  if (wrap) {
    var tmp = document.createElement('div');
    tmp.innerHTML = koHtml;
    var koSection = tmp.firstElementChild;
    var footer = wrap.querySelector('.footer');
    footer ? wrap.insertBefore(koSection, footer) : wrap.appendChild(koSection);
  }

  // Nav Button
  var navrow = document.querySelector('.navrow');
  if (navrow) {
    var btn = document.createElement('button');
    btn.className = 'navbtn';
    btn.textContent = '⚡ K.O.-Runden';
    btn.onclick = function(){ if(typeof switchTab==='function') switchTab('ko', btn); };
    navrow.appendChild(btn);
  }

  // ── ERGEBNISSE AUSWERTEN ──────────────────────────────────
  function loadKOResults(data) {
    var koCards = document.querySelectorAll('.ko-card');
    var koCorrect=0, koExact=0, koPts=0, koPlayed=0, koTeamHits=0;

    data.forEach(function(r){
      if(r.status !== 'finished') return;
      if(!r.home && r.home!==0) return;
      var rTeams = (r.teams||'').toLowerCase();

      koCards.forEach(function(card){
        var dt = (card.getAttribute('data-teams')||'').toLowerCase();
        var parts = dt.split('|');
        if(parts.length<2) return;
        var cA=norm(parts[0]), cB=norm(parts[1]);

        var rParts = rTeams.split(' ');
        var matched = false;
        for(var i=1;i<rParts.length;i++){
          var rA=rParts.slice(0,i).join(' '), rB=rParts.slice(i).join(' ');
          if((norm(rA)===cA&&norm(rB)===cB)||(norm(rA)===cB&&norm(rB)===cA)){
            matched=true; break;
          }
        }
        if(!matched) return;

        var resultDiv = card.querySelector('[id^="ko-result-"]');
        if(!resultDiv) return;
        var scoreEl = resultDiv.querySelector('[id^="ko-score-"]');
        var deltaEl = resultDiv.querySelector('[id^="ko-delta-"]');
        resultDiv.style.display='block';
        var eA=parseInt(r.home)||0, eB=parseInt(r.away)||0;
        if(scoreEl) scoreEl.textContent = eA+':'+eB;
        koPlayed++;

        var predT1=norm(parts[0]), predT2=norm(parts[1]);
        var realT1=r.real_team1?norm(r.real_team1):predT1;
        var realT2=r.real_team2?norm(r.real_team2):predT2;
        var teamMatch = (realT1===predT1&&realT2===predT2)||(realT1===predT2&&realT2===predT1);

        if(!teamMatch){
          card.classList.add('team-mismatch');
          if(!card.querySelector('.ko-mismatch-note')){
            var mn=document.createElement('div');
            mn.className='ko-mismatch-note';
            mn.textContent='⚠️ Tatsächliche Teams weichen von KI-Prognose ab → 0 Punkte';
            card.querySelector('.mc-body').insertBefore(mn, resultDiv);
          }
          if(deltaEl) deltaEl.innerHTML='<span class="mc-delta gray">⚠️ Falsche Teams – 0 Pkt</span>';
          card.setAttribute('data-cat','mismatch');
          card.setAttribute('data-pts','0');
          card.setAttribute('data-result',eA+':'+eB);
          return;
        }

        koTeamHits++;
        var prog90=card.getAttribute('data-prog90')||card.getAttribute('data-prog')||'';
        var pm=prog90.match(/(\d+):(\d+)/);
        if(!pm){ card.setAttribute('data-result',eA+':'+eB); return; }
        var pA=parseInt(pm[1]),pB=parseInt(pm[2]);
        var kt=ktPoints(pA,pB,eA,eB);
        koPts+=kt.pts;
        if(kt.cat==='exact'||kt.cat==='tordiff'||kt.cat==='tendenz') koCorrect++;
        if(kt.cat==='exact') koExact++;

        var b=BADGE[kt.cat]||BADGE.miss;
        if(deltaEl) deltaEl.innerHTML='<span class="mc-delta '+(kt.pts>=3?'good':(kt.pts===2?'mid':'bad'))+'">'+b.lbl+'</span>';
        card.setAttribute('data-result',eA+':'+eB);
        card.setAttribute('data-cat',kt.cat);
        card.setAttribute('data-pts',String(kt.pts));

        var scoreBox=card.querySelector('.mc-score');
        if(scoreBox){ scoreBox.textContent=eA+':'+eB; scoreBox.style.color='var(--text)'; scoreBox.style.fontSize='20px'; }
      });
    });

    function setEl(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; }
    setEl('ko-correct',koCorrect);
    setEl('ko-exact',koExact);
    setEl('ko-pts',koPts);
    setEl('ko-team-hits',koTeamHits+'/'+koPlayed);

    buildKOStatistik(koCorrect,koExact,koPts,koPlayed,koTeamHits);
    buildKOCompare(data);
  }

  // ── STATISTIK-TAB INTEGRATION ────────────────────────────
  function buildKOStatistik(koCorrect,koExact,koPts,koPlayed,koTeamHits){
    var statSection = document.getElementById('tab-statistik');
    if(!statSection) return;

    var existing = document.getElementById('ko-stat-block');
    if(existing) existing.remove();

    function kpi(lbl,val,col){
      return '<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;text-align:center">'+
        '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">'+lbl+'</div>'+
        '<div style="font-size:24px;font-weight:900;color:'+col+'">'+val+'</div></div>';
    }

    var hr = koPlayed>0 ? Math.round(koCorrect/koPlayed*100) : 0;
    var hrCol = hr>=65?'var(--green)':hr>=45?'var(--gold)':'var(--red)';
    var avgPts = koPlayed>0 ? (koPts/koPlayed).toFixed(2) : '–';

    var block = document.createElement('div');
    block.id = 'ko-stat-block';
    block.style.cssText = 'margin-top:32px;padding-top:24px;border-top:1px solid var(--line)';
    block.innerHTML =
      '<h3 style="font-size:18px;font-weight:900;margin-bottom:16px;color:var(--text)">⚡ KO-Runden Statistik</h3>'+
      '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">Punkte werden nur vergeben wenn die tatsächlichen Teams mit der KI-Prognose übereinstimmen.</p>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:20px">'+
        kpi('KO Gespielt',koPlayed,'var(--text)')+
        kpi('🏆 KO Punkte',koPts,'var(--gold)')+
        kpi('∅ Pkt/Spiel',avgPts,'var(--blue)')+
        kpi('✅ Exakt (4)',koExact,'var(--green)')+
        kpi('Trefferquote',hr+'%',hrCol)+
        kpi('Teams korrekt',koTeamHits+'/'+koPlayed,'var(--violet)')+
      '</div>';

    var tbody = document.getElementById('stat-tbody');
    if(tbody){
      var koRows = [];
      document.querySelectorAll('.ko-card').forEach(function(card){
        var res  = card.getAttribute('data-result')||'';
        var cat  = card.getAttribute('data-cat')||'';
        var prog = card.getAttribute('data-prog90')||card.getAttribute('data-prog')||'';
        var pts  = parseInt(card.getAttribute('data-pts')||'0');
        if(!res||!prog) return;
        var rm=res.match(/(\d+):(\d+)/), pm=prog.match(/(\d+):(\d+)/);
        if(!rm||!pm) return;
        var eA=parseInt(rm[1]),eB=parseInt(rm[2]),pA=parseInt(pm[1]),pB=parseInt(pm[2]);
        var names=card.querySelectorAll('.mc-name');
        var tA=names[0]?names[0].textContent.trim():'?';
        var tB=names[1]?names[1].textContent.trim():'?';
        var runde=card.getAttribute('data-round')||'KO';
        var dA=eA-pA,dB=eB-pB;
        var b=BADGE[cat]||BADGE.miss;
        var isTend=(cat==='exact'||cat==='tordiff'||cat==='tendenz');
        var isTD=(cat==='exact'||cat==='tordiff');
        var isExact=(cat==='exact');
        koRows.push('<tr data-cat="'+cat+'" style="background:rgba(179,139,255,.04)">'+
          '<td style="font-weight:700;font-size:12px"><span style="font-size:10px;color:var(--violet);background:rgba(179,139,255,.15);padding:2px 6px;border-radius:999px;margin-right:6px">'+runde.replace(/^[A-Z] /,'')+'</span>'+tA+' – '+tB+'</td>'+
          '<td style="font-family:monospace;color:var(--gold)">'+prog+'</td>'+
          '<td style="font-family:monospace;font-weight:900">'+res+'</td>'+
          '<td style="color:'+(dA===0?'var(--green)':'var(--red)')+';font-weight:700">'+(dA===0?'✓':(dA>0?'+'+dA:String(dA)))+'</td>'+
          '<td style="color:'+(dB===0?'var(--green)':'var(--red)')+';font-weight:700">'+(dB===0?'✓':(dB>0?'+'+dB:String(dB)))+'</td>'+
          '<td><span style="background:'+b.bg+';color:'+b.col+';padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700">'+b.lbl+'</span></td>'+
          '<td style="text-align:center;font-size:17px;font-weight:900;color:'+b.col+'">'+pts+'</td>'+
          '<td style="text-align:center;color:'+(isTend?'var(--green)':'var(--muted)')+'">'+( isTend?'✓':'–')+'</td>'+
          '<td style="text-align:center;color:'+(isTD?'var(--blue)':'var(--muted)')+'">'+( isTD?'✓':'–')+'</td>'+
          '<td style="text-align:center;color:'+(isExact?'var(--green)':'var(--muted)')+'">'+( isExact?'✓':'–')+'</td>'+
          '</tr>');
      });
      if(koRows.length){
        var sep='<tr><td colspan="10" style="padding:6px 8px;font-size:11px;color:var(--violet);font-weight:800;background:rgba(179,139,255,.06);letter-spacing:.08em">⚡ KO-RUNDEN</td></tr>';
        tbody.insertAdjacentHTML('beforeend', sep+koRows.join(''));
      }
    }

    statSection.appendChild(block);
  }

  // ── KO PROGNOSE-VERGLEICH ─────────────────────────────────
  function buildKOCompare(data){
    var statSection=document.getElementById('tab-statistik');
    if(!statSection) return;
    var existing=document.getElementById('ko-compare-block');
    if(existing) existing.remove();

    var allCards=[];
    document.querySelectorAll('.ko-card').forEach(function(card){
      var dt=(card.getAttribute('data-teams')||'').split('|');
      var runde=card.getAttribute('data-round')||'';
      var prog90=card.getAttribute('data-prog90')||'';
      var proNE=card.getAttribute('data-prone')||'';
      var winner=card.getAttribute('data-winner')||'';
      var names=card.querySelectorAll('.mc-name');
      var tA=names[0]?names[0].textContent.trim():'?';
      var tB=names[1]?names[1].textContent.trim():'?';
      allCards.push({predT1:tA,predT2:tB,prog90:prog90,proNE:proNE,winner:winner,runde:runde,dt:dt});
    });

    var realMap={};
    data.forEach(function(r){
      if(r.ko_slot) realMap[r.ko_slot]={real_team1:r.real_team1||'',real_team2:r.real_team2||'',status:r.status};
    });

    var rows=allCards.map(function(c,i){
      var slot='ko'+(i+1);
      var real=realMap[slot]||{};
      var status=real.status||'offen';
      var rT1=real.real_team1?real.real_team1:'?';
      var rT2=real.real_team2?real.real_team2:'?';
      var t1ok=(rT1!=='?')&&(norm(rT1)===norm(c.predT1));
      var t2ok=(rT2!=='?')&&(norm(rT2)===norm(c.predT2));
      var rowClass=rT1==='?'?'match-open':(t1ok&&t2ok?'match-ok':'match-miss');
      var scoreDisplay=c.proNE||c.prog90;
      return '<tr class="'+rowClass+'">'+
        '<td style="font-size:11px;color:var(--violet);">'+c.runde.replace(/^[A-Z] /,'')+'</td>'+
        '<td style="font-weight:700"><span class="'+(rT1!=='?'?(t1ok?'team-ok':'team-wrong'):'team-open')+'">'+c.predT1+'</span></td>'+
        '<td style="font-family:monospace;color:var(--gold);">'+scoreDisplay+'</td>'+
        '<td style="font-weight:700"><span class="'+(rT2!=='?'?(t2ok?'team-ok':'team-wrong'):'team-open')+'">'+c.predT2+'</span></td>'+
        '<td style="font-weight:700;color:var(--muted)">'+(rT1!=='?'?rT1:'<em>noch offen</em>')+'</td>'+
        '<td style="font-family:monospace;font-size:11px">'+(status==='finished'?'✅ Gespielt':'⏳ '+status)+'</td>'+
        '<td><span style="font-size:11px;font-weight:800;color:'+(rT1==='?'?'var(--muted)':(t1ok&&t2ok?'var(--green)':'var(--red)'))+'">'+( rT1==='?'?'Offen':(t1ok&&t2ok?'✅ Korrekt':'❌ Abweichung'))+'</span></td>'+
        '</tr>';
    }).join('');

    var block=document.createElement('div');
    block.id='ko-compare-block';
    block.className='ko-compare-section';
    block.innerHTML=
      '<h3>📊 KO-Prognose-Vergleich: KI-Teams vs. Echte Teams</h3>'+
      '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">'+
        '🟢 Grün = Teams stimmen überein · 🔴 Rot = Abweichung → 0 Punkte · Grau = noch nicht gespielt</p>'+
      '<div style="overflow-x:auto"><table class="ko-ctbl">'+
        '<thead><tr>'+
          '<th>Runde</th><th>KI: Team 1</th><th>KI: Prognose</th><th>KI: Team 2</th>'+
          '<th>Echt: Teams</th><th>Status</th><th>Übereinstimmung</th>'+
        '</tr></thead>'+
        '<tbody>'+rows+'</tbody>'+
      '</table></div>';
    statSection.appendChild(block);
  }

  // ── loadResults ERWEITERN ────────────────────────────────
  var _origLoad=window.loadResults;
  window.loadResults=function(){
    var p=(_origLoad?_origLoad():Promise.resolve());
    Promise.resolve(p).then(function(){
      fetch('./results.json?v='+Date.now())
        .then(function(r){ return r.json(); })
        .then(function(data){ loadKOResults(data); })
        .catch(function(e){ console.warn('[ko-inject] KO Results load failed',e); });
    });
  };

  // Initial laden
  if(document.readyState==='complete'||document.readyState==='interactive'){
    setTimeout(function(){ window.loadResults&&window.loadResults(); },900);
  } else {
    document.addEventListener('DOMContentLoaded',function(){
      setTimeout(function(){ window.loadResults&&window.loadResults(); },900);
    });
  }

})();
