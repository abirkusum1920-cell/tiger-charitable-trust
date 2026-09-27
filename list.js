/* ===== সেবাগ্রহীতাদের সর্বজনীন তালিকা (public.js + photos.js থেকে) ===== */
(function(){
  var sec = document.getElementById("members"); if(!sec) return;
  var card = sec.querySelector(".card");
  var st = document.createElement("style");
  st.textContent = ".ps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:4px 0 12px}.ps div{background:#fff;border:1px solid #e8dcc4;border-radius:14px;padding:8px 4px}.ps b{display:block;font-size:22px;color:#e65100;font-family:Georgia,serif}.ps span{font-size:13px;color:#5b4d3e}.pi{display:grid;gap:6px;margin-bottom:14px;text-align:left}.pi div{background:#fff;border:1px solid #e8dcc4;border-radius:12px;padding:8px 12px;font-size:15px}.pi b{color:#2e7d32}.pi em{font-style:normal;color:#c62828;font-weight:700}.pu{font-size:13px;color:#5b4d3e;margin:-4px 0 12px}.pch{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0 10px}.pch button{font:inherit;font-size:14px;border:1px solid #e8dcc4;background:#fff;border-radius:20px;padding:4px 12px;cursor:pointer}.pch button.on{background:#e65100;color:#fff;border-color:#e65100}.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pc{background:#fff;border:1px solid #e8dcc4;border-radius:14px;overflow:hidden;padding-bottom:6px}.pc img,.pc .np{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:#ffe3b3}.pc .np{display:flex;align-items:center;justify-content:center;font-size:30px}.pc b{display:block;padding:4px 3px 0;font-size:13px;line-height:1.35}.pc i{font-style:normal;font-size:11px;padding:0 7px;border-radius:10px;background:#fce7f3;color:#be185d}.pc i.M{background:#dbeafe;color:#1d4ed8}.pc small{display:block;font-size:11px;color:#2e7d32;line-height:1.3;padding:2px 3px 0}.pmore{margin-top:12px}";
  document.head.appendChild(st);
  var box = document.createElement("div"); box.id = "pubBox"; box.innerHTML = '<div class="pu">লোড হচ্ছে...</div>';
  card.appendChild(box);

  var sc = document.createElement("script");
  sc.src = "public.js?v=" + Date.now().toString().slice(0, 7);
  sc.onload = function(){ if(window.TIGER_PUBLIC) show(window.TIGER_PUBLIC); };
  sc.onerror = function(){ box.innerHTML = '<div class="pu">তালিকা এখনো প্রকাশ করা হয়নি</div>'; };
  document.body.appendChild(sc);

  function show(P){
    var M = P.members, I = P.items || [], F = 0, Ml = 0, got = 0;
    M.forEach(function(m){ if(m[2] == "F") F++; else if(m[2] == "M") Ml++; if(m[3].length) got++; });
    var h = '<div class="ps"><div><b>' + M.length + '</b><span>মোট সদস্য</span></div><div><b>' + F + '</b><span>মা</span></div><div><b>' + Ml + '</b><span>বাবা</span></div>' +
      '<div><b>' + got + '</b><span>স্লিপ পেয়েছেন</span></div><div><b>' + (M.length - got) + '</b><span>স্লিপ পাননি</span></div><div><b>' + I.length + '</b><span>রকম সামগ্রী</span></div></div>';
    if(I.length){
      h += '<div class="pi">' + I.map(function(it, k){
        var n = M.filter(function(m){ return m[3].indexOf(k) > -1; }).length;
        return '<div>' + esc(it) + ': পেয়েছেন <b>' + n + '</b> জন · পাননি <em>' + (M.length - n) + '</em> জন</div>';
      }).join("") + '</div>';
    }
    h += '<div class="pu">সর্বশেষ আপডেট: ' + esc(P.updated || "") + '</div>' +
      '<button class="btn" id="pShow">তালিকা দেখুন</button><div id="pList" hidden></div>' +
      '<p class="pmore"><a href="sadasya/" style="font-size:14px;color:#5b4d3e;text-decoration:underline">অ্যাডমিন: সদস্য খাতা খুলুন</a></p>';
    box.innerHTML = h;
    var old = card.querySelector('[data-toggle="benList"]'); if(old) old.remove();
    var oldL = document.getElementById("benList"); if(oldL) oldL.remove();
    var oldA = card.querySelector('a[href="sadasya/"].btn'); if(oldA) oldA.remove();

    var f = "all", q = "", shown = 60, list = document.getElementById("pList"), photosAsked = false;
    var sorted = M.slice().sort(function(a, b){ return (b[0] || 0) - (a[0] || 0); });   // নতুন সদস্য সবার আগে
    function rows(){
      return sorted.filter(function(m){
        if(f == "F" || f == "M"){ if(m[2] != f) return false; }
        else if(f == "got"){ if(!m[3].length) return false; }
        else if(f == "none"){ if(m[3].length) return false; }
        else if(f != "all"){ if(m[3].indexOf(+f) < 0) return false; }
        return !q || String(m[1]).toLowerCase().indexOf(q) > -1 || String(m[0]) == q;
      });
    }
    function draw(){
      var R = rows(), PH = window.TIGER_PHOTOS || {};
      var chips = [["all", "সব"], ["F", "মা"], ["M", "বাবা"], ["got", "স্লিপ পেয়েছেন"], ["none", "পাননি"]].concat(I.map(function(it, k){ return [String(k), it]; }));
      list.innerHTML = '<input id="pQ" placeholder="🔎 নাম বা নম্বর খুঁজুন" value="' + esc(q) + '">' +
        '<div class="pch">' + chips.map(function(c){ return '<button data-f="' + c[0] + '" class="' + (f == c[0] ? "on" : "") + '">' + esc(c[1]) + '</button>'; }).join("") + '</div>' +
        '<div class="pu">' + R.length + ' জন দেখানো হচ্ছে</div><div class="pg">' + R.slice(0, shown).map(function(m){
          var p = PH[m[0]];
          return '<div class="pc">' + (p ? '<img loading="lazy" src="' + p + '" alt="">' : '<div class="np">' + (m[2] == "M" ? "👴" : "👵") + '</div>') +
            '<b>#' + m[0] + ' · ' + esc(m[1]) + '</b>' + (m[2] ? '<i class="' + m[2] + '">' + (m[2] == "F" ? "মা" : "বাবা") + '</i>' : '') +
            (m[3].length ? '<small>✓ ' + m[3].map(function(k){ return esc(I[k] || ""); }).join(", ") + '</small>' : '') + '</div>';
        }).join("") + '</div>' + (R.length > shown ? '<button class="btn o pmore" id="pMore">আরও দেখুন</button>' : '');
      var qi = document.getElementById("pQ");
      qi.oninput = function(){ q = toEn(this.value).trim().toLowerCase(); shown = 60; draw(); var n = document.getElementById("pQ"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      list.querySelectorAll(".pch button").forEach(function(b){ b.onclick = function(){ f = b.dataset.f; shown = 60; draw(); }; });
      var mo = document.getElementById("pMore"); if(mo) mo.onclick = function(){ shown += 60; draw(); };
    }
    document.getElementById("pShow").onclick = function(){
      list.hidden = !list.hidden; this.textContent = list.hidden ? "তালিকা দেখুন" : "বন্ধ করুন ✕";
      if(!list.hidden) draw();
      if(!photosAsked){   // ছবি শুধু তালিকা খুললে তবেই আসে — কম নেটে সাইট দ্রুত খোলে
        photosAsked = true;
        var ps = document.createElement("script");
        ps.src = "photos.js?v=" + Date.now().toString().slice(0, 7);
        ps.onload = function(){ if(!list.hidden) draw(); };
        document.body.appendChild(ps);
      }
    };
  }
})();
      
