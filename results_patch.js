/**
 * results_patch.js  –  WM 2026 Tipp-Dashboard
 * Lädt results.json und updated alle .mcard Elemente + Statistik-Tab live.
 * Kein Unentschieden in K.o.-Runden (n.E.-Logik separat).
 */

(function () {
  'use strict';

  /* ── 1. Alias-Tabelle: index.html-Schreibweise → results.json-Schreibweise ── */
  var ALIAS = {
    'elfenbeink.'      : 'elfenbeinküste',
    'elfenbeinküste'   : 'elfenbeinküste',
    'bosnien-h.'       : 'bosnien-herzegowina',
    'bosnien-herzegowina':'bosnien-herzegowina',
    'saudi-arab.'      : 'saudi-arabien',
    'saudi-arabien'    : 'saudi-arabien',
    'kap verde'        : 'cape verde islands',
    'cape verde islands':'cape verde islands',
    'cape verde'       : 'cape verde islands',
    'dr kongo'         : 'dr kongo',
    'curaçao'          : 'curaçao',
    'ägypten'          : 'ägypten',
    'österreich'       : 'österreich',
  };

  function norm(s) {
    var t = s.trim().toLowerCase();
    return ALIAS[t] || t;
  }

  /* ── 2. Kicktipp-Punkte ── */
  function ktPoints(pA, pB, eA, eB) {
    var pW = pA > pB ? 'A' : (pA < pB ? 'B' : 'U');
    var eW = eA > eB ? 'A' : (eA < eB ? 'B' : 'U');
    if (pW !== eW) return { pts: 0, cat: 'miss' };
    if (pA === eA && pB === eB) return { pts: 4, cat: 'exact' };
    if (eW !== 'U' && (pA - pB) === (eA - eB)) return { pts: 3, cat: 'tordiff' };
    return { pts: eW === 'U' ? 3 : 2, cat: 'tendenz' };
  }

  /* ── 3. Badge-HTML ── */
  var BADGE = {
    exact   : { col: 'var(--green)', bg: 'rgba(73,210,140,.2)',   lbl: '✅ 4 Pkt Exakt'   },
    tordiff : { col: 'var(--blue)',  bg: 'rgba(103,164,255,.2)',  lbl: '🎯 3 Pkt Tordiff.' },
    tendenz2: { col: 'var(--gold)',  bg: 'rgba(243,184,59,.2)',   lbl: '🟢 2 Pkt Tendenz'  },
    tendenz3: { col: 'var(--gold)',  bg: 'rgba(243,184,59,.2)',   lbl: '🟢 3 Pkt Unentsch.' },
    miss    : { col: 'var(--red)',   bg: 'rgba(255,93,115,.15)',  lbl: '❌ 0 Pkt Fehler'   },
  };

  function badgeStyle(cat, pts) {
    var key = cat === 'tendenz' ? (pts === 3 ? 'tendenz3' : 'tendenz2') : cat;
    var b = BADGE[key] || BADGE.miss;
    return '<span class="kt-badge" style="font-size:11px;padding:3px 8px;border-radius:999px;font-weight:700;background:' +
      b.bg + ';color:' + b.col + '">' + b.lbl + '</span>';
  }

  /* ── 4. Karte aktualisieren ── */
  function updateCard(card, eA, eB) {
    var prog  = card.getAttribute('data-prog') || '';
    var pmatch = prog.match(/(\d+):(\d+)/);
    if (!pmatch) return;
    var pA = parseInt(pmatch[1]), pB = parseInt(pmatch[2]);
    var kt = ktPoints(pA, pB, eA, eB);
    var scoreEl = card.querySelector('.mc-score');
    if (scoreEl) {
      scoreEl.textContent = eA + ':' + eB;
      scoreEl.style.fontSize   = '20px';
      scoreEl.style.fontWeight = '900';
      scoreEl.style.color      = 'var(--text)';
    }
    /* Badge Bereich (erste div.flex) */
    var header = card.querySelector('div:first-child');
    if (header) {
      var oldBadge = header.querySelector('.kt-badge');
      if (oldBadge) oldBadge.remove();
      header.insertAdjacentHTML('beforeend', badgeStyle(kt.cat, kt.pts));
    }
    card.setAttribute('data-result', eA + ':' + eB);
    card.setAttribute('data-cat',    kt.cat);
    card.setAttribute('data-pts',    String(kt.pts));
  }

  /* ── 5. Ergebnis-Lookup aus results.json ── */
  function buildLookup(results) {
    var map = {};
    results.forEach(function (r) {
      var parts = r.teams.split(' ');
      /* Alle Kombinationen von Trennpunkten durchprobieren (für mehrteilige Namen) */
      for (var i = 1; i < parts.length; i++) {
        var home = parts.slice(0, i).join(' ');
        var away = parts.slice(i).join(' ');
        var key1 = home + '||' + away;
        var key2 = away + '||' + home;
        map[key1] = { home: r.home, away: r.away };
        map[key2] = { home: r.away, away: r.home };
      }
    });
    return map;
  }

  /* ── 6. Hauptfunktion ── */
  function applyResults(results) {
    var lookup = buildLookup(results);
    var cards  = document.querySelectorAll('.mcard');
    var matched = 0;

    cards.forEach(function (card) {
      var dt = card.getAttribute('data-teams') || '';
      var teams = dt.split('|');
      if (teams.length < 2) return;
      var nA = norm(teams[0]);
      var nB = norm(teams[1]);
      var key = nA + '||' + nB;
      var entry = lookup[key];
      if (!entry) return;
      updateCard(card, entry.home, entry.away);
      matched++;
    });

    console.log('[results_patch] ' + matched + ' / ' + cards.length + ' Karten aktualisiert.');
    buildStatistik();
  }

  /* ── 7. Statistik-Tabelle aufbauen ── */
  function buildStatistik() {
    var tbody  = document.getElementById('stat-tbody');
    var kpisEl = document.getElementById('stat-kpis');
    var ptsEl  = document.getElementById('pts-kpis');
    if (!tbody) return;

    var rows = [], totalPts = 0, cnt = { exact:0, tordiff:0, tendenz:0, miss:0 };
    var totalGoals = 0, played = 0;

    document.querySelectorAll('.mcard').forEach(function (card) {
      var res  = card.getAttribute('data-result') || '';
      var cat  = card.getAttribute('data-cat')    || '';
      var prog = card.getAttribute('data-prog')   || '';
      if (!res || !prog) return;
      var rm = res.match(/(\d+):(\d+)/), pm = prog.match(/(\d+):(\d+)/);
      if (!rm || !pm) return;
      var eA=parseInt(rm[1]),eB=parseInt(rm[2]),pA=parseInt(pm[1]),pB=parseInt(pm[2]);
      var names = card.querySelectorAll('.mc-name');
      var tA = names[0] ? names[0].textContent.trim() : '?';
      var tB = names[1] ? names[1].textContent.trim() : '?';
      var kt = ktPoints(pA,pB,eA,eB);
      totalPts += kt.pts;
      played++;
      totalGoals += (eA+eB);
      if (kt.cat in cnt) cnt[kt.cat]++; else cnt.miss++;
      var dA = eA-pA, dB = eB-pB;
      rows.push({tA:tA,tB:tB,prog:prog,res:res,
        dA:(dA===0?'✓':(dA>0?'+'+dA:String(dA))),
        dB:(dB===0?'✓':(dB>0?'+'+dB:String(dB))),
        daC:dA===0?'var(--green)':'var(--red)',
        dbC:dB===0?'var(--green)':'var(--red)',
        cat:kt.cat,pts:kt.pts});
    });

    /* Tabelle rendern */
    tbody.innerHTML = rows.map(function(r){
      var b = BADGE[r.cat==='tendenz'?(r.pts===3?'tendenz3':'tendenz2'):r.cat] || BADGE.miss;
      var isTend = (r.cat==='tendenz'||r.cat==='tordiff'||r.cat==='exact');
      var isTD   = (r.cat==='tordiff'||r.cat==='exact');
      var isExact= (r.cat==='exact');
      return '<tr data-cat="'+r.cat+'">' +
        '<td style="font-weight:700">'+r.tA+' – '+r.tB+'</td>'+
        '<td style="font-family:monospace;color:var(--gold)">'+r.prog+'</td>'+
        '<td style="font-family:monospace;font-weight:900">'+r.res+'</td>'+
        '<td style="color:'+r.daC+';font-weight:700">'+r.dA+'</td>'+
        '<td style="color:'+r.dbC+';font-weight:700">'+r.dB+'</td>'+
        '<td><span style="background:'+b.bg+';color:'+b.col+
          ';padding:3px 9px;border-radius:999px;font-size:12px;font-weight:700">'+b.lbl+'</span></td>'+
        '<td style="text-align:center;font-size:17px;font-weight:900;color:'+b.col+'">'+r.pts+'</td>'+
        '<td style="text-align:center;color:'+(isTend?'var(--green)':'var(--muted)')+'">'+( isTend?'✓':'–')+'</td>'+
        '<td style="text-align:center;color:'+(isTD?'var(--blue)':'var(--muted)')+'">'+( isTD?'✓':'–')+'</td>'+
        '<td style="text-align:center;color:'+(isExact?'var(--green)':'var(--muted)')+'">'+( isExact?'✓':'–')+'</td>'+
        '</tr>';
    }).join('');

    /* KPI-Blöcke */
    function kpi(lbl,val,col){
      return '<div style="background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;text-align:center">'+
        '<div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">'+lbl+'</div>'+
        '<div style="font-size:26px;font-weight:900;color:'+col+'">'+val+'</div></div>';
    }
    var hr = played>0 ? Math.round((cnt.exact+cnt.tordiff+cnt.tendenz)/played*100) : 0;
    var avg = played>0 ? (totalGoals/played).toFixed(2) : '–';
    var hrCol = hr>=65?'var(--green)':hr>=45?'var(--gold)':'var(--red)';
    if(kpisEl) kpisEl.innerHTML =
      kpi('Gespielte Spiele', played,      'var(--text)')+
      kpi('✅ Exakt (4Pkt)', cnt.exact,    'var(--green)')+
      kpi('🎯 Tordiff. (3)', cnt.tordiff,  'var(--blue)')+
      kpi('🟢 Tendenz (2–3)',cnt.tendenz,  'var(--gold)')+
      kpi('❌ Fehltipps (0)',cnt.miss,     'var(--red)')+
      kpi('Trefferquote',    hr+'%',       hrCol)+
      kpi('Ø Tore/Spiel',    avg,          'var(--blue)');

    /* Punkte-KPIs mit Max-Anzeige */
    var maxPts = played * 4;
    var ausschoepfung = played > 0 ? Math.round(totalPts / maxPts * 100) : 0;
    var ausschoepfCol = ausschoepfung >= 65 ? 'var(--green)' : ausschoepfung >= 45 ? 'var(--gold)' : 'var(--red)';
    if(ptsEl) ptsEl.innerHTML =
      kpi('🏆 Gesamt-Punkte', totalPts + ' / ' + maxPts + ' max', 'var(--gold)')+
      kpi('📊 Ausschöpfung',  played > 0 ? ausschoepfung + '%' : '–', ausschoepfCol)+
      kpi('∅ Pkt/Spiel', played>0?(totalPts/played).toFixed(2):'–', 'var(--blue)')+
      kpi('✅ Exakt',      cnt.exact,       'var(--green)')+
      kpi('🎯 Tordiff.',   cnt.tordiff,     'var(--blue)')+
      kpi('🟢 Tendenz',    cnt.tendenz,     'var(--gold)')+
      kpi('❌ Fehltipps',  cnt.miss,        'var(--red)');
  }

  /* ── 8. Fetch + Init ── */
  function init() {
    var url = './results.json?v=' + Date.now();
    fetch(url)
      .then(function(r){ return r.json(); })
      .then(function(data){ applyResults(data); })
      .catch(function(e){ console.warn('[results_patch] Fetch fehlgeschlagen:', e); });
  }

  /* Starten nach DOM-Ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Globale Hilfsfunktionen */
  window.buildStatistik     = buildStatistik;
  window.applyResultsPatch  = applyResults;

})();
