/* ===== সদস্য খাতা → ওয়েবসাইটে স্বয়ংক্রিয় প্রকাশ =====
   এই ফোনে সদস্য খাতা খোলা থাকলে প্রতি মিনিটে দেখে নতুন সদস্য/স্লিপ হয়েছে কি না।
   হলে শুধু নাম, নম্বর, মা/বাবা, কে কী পেয়েছেন আর ছোট ছবি GitHub-এ public.js ও photos.js-এ তুলে দেয়।
   ফোন নম্বর, আধার, ঠিকানা কখনো যায় না। */
(function(){
  var REPO = "abirkusum1920-cell/tiger-charitable-trust", BR = "main";
  var LS = { tok: "tigerGhToken", s1: "tigerPubSig1", s2: "tigerPubSig2", at: "tigerPubAt" };
  function get(k){ try { return localStorage.getItem(k) || ""; } catch(e){ return ""; } }
  function set(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function hash(s){ var h = 5381; for(var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h >>> 0); }
  var busy = false, thumbs = {}, lastMsg = "";

  // ---------- ছোট বোতাম আর প্যানেল ----------
  var css = document.createElement("style");
  css.textContent = "#apB{position:fixed;left:12px;bottom:84px;z-index:60;width:44px;height:44px;border-radius:50%;border:0;background:#166534;color:#fff;font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,.25)}#apB.off{background:#9ca3af}#apB.err{background:#b91c1c}#apP{position:fixed;left:12px;right:12px;bottom:136px;z-index:61;background:#fff;border-radius:16px;padding:14px;box-shadow:0 6px 24px rgba(0,0,0,.25);font-size:15px;max-width:460px}#apP input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #ddd;border-radius:10px;margin:8px 0}#apP button{padding:9px 16px;border-radius:20px;border:0;background:#C2410C;color:#fff;font-weight:700;margin:4px 4px 0 0}";
  document.head.appendChild(css);
  var btn = document.createElement("button"); btn.id = "apB"; btn.textContent = "🌐"; btn.setAttribute("aria-label", "ওয়েবসাইটে প্রকাশ");
  var pan = document.createElement("div"); pan.id = "apP"; pan.hidden = true;
  document.body.appendChild(btn); document.body.appendChild(pan);
  function paint(){
    btn.className = !get(LS.tok) ? "off" : (lastMsg.indexOf("❌") == 0 ? "err" : "");
    if(pan.hidden) return;
    if(!get(LS.tok)){
      pan.innerHTML = "<b>ওয়েবসাইটে স্বয়ংক্রিয় প্রকাশ</b><br>GitHub টোকেন পেস্ট করুন (একবারই লাগবে):<input id='apT' placeholder='github_pat_...'><button id='apS'>সংরক্ষণ</button><button id='apC'>বন্ধ</button>";
      document.getElementById("apS").onclick = function(){ var v = document.getElementById("apT").value.trim(); if(v){ set(LS.tok, v); set(LS.s1, ""); set(LS.s2, ""); lastMsg = "টোকেন সংরক্ষিত — প্রকাশ হচ্ছে..."; paint(); run(true); } };
    } else {
      var at = get(LS.at);
      var bad = lastMsg.indexOf("টোকেন") > -1 && lastMsg.indexOf("❌") == 0;   // টোকেন নষ্ট হলে শুধু তখনই নতুন টোকেন বসানোর ঘর দেখায়
      pan.innerHTML = "<b>ওয়েবসাইটে স্বয়ংক্রিয় প্রকাশ চালু ✅</b><br>শেষ প্রকাশ: " + (at ? new Date(+at).toLocaleString("bn-IN") : "এখনো হয়নি") + "<br>" + (lastMsg || "") +
        (bad ? "<br>নতুন টোকেন পেস্ট করুন:<input id='apT' placeholder='github_pat_...'><button id='apS'>নতুন টোকেন সংরক্ষণ</button>" : "") +
        "<br><button id='apN'>এখনই প্রকাশ করুন</button><button id='apC'>বন্ধ</button>";
      document.getElementById("apN").onclick = function(){ run(true); };
      if(bad) document.getElementById("apS").onclick = function(){ var v = document.getElementById("apT").value.trim(); if(v){ set(LS.tok, v); lastMsg = "নতুন টোকেন সংরক্ষিত — প্রকাশ হচ্ছে..."; paint(); run(true); } };
    }
    document.getElementById("apC").onclick = function(){ pan.hidden = true; };
  }
  btn.onclick = function(){ pan.hidden = !pan.hidden; paint(); };

  // ---------- ফোনের সদস্য খাতা পড়া ----------
  function readDB(){
    return new Promise(function(ok, bad){
      var rq = indexedDB.open("tiger-sadasya");
      rq.onupgradeneeded = function(){ rq.transaction.abort(); };
      rq.onerror = function(){ bad(new Error("সদস্য খাতার তথ্য পাওয়া যায়নি")); };
      rq.onsuccess = function(){
        var db = rq.result, t = db.transaction(["members", "slips", "photos"]);
        var a = t.objectStore("members").getAll(), b = t.objectStore("slips").getAll(), c = t.objectStore("photos").getAll();
        t.oncomplete = function(){ ok({ m: a.result || [], s: b.result || [], p: c.result || [] }); db.close(); };
        t.onerror = function(){ bad(new Error("পড়া যায়নি")); };
      };
    });
  }
  function thumb(src){
    return new Promise(function(ok){
      if(!src){ ok(""); return; }
      var im = new Image();
      im.onload = function(){ var S = 72, c = document.createElement("canvas"); c.width = S; c.height = S; var x = c.getContext("2d"), w = im.width, h = im.height, m = Math.min(w, h);
        x.drawImage(im, (w - m) / 2, (h - m) / 2, m, m, 0, 0, S, S); ok(c.toDataURL("image/jpeg", 0.55)); };
      im.onerror = function(){ ok(""); }; im.src = src;
    });
  }
  async function build(D){
    var list = D.m.filter(function(m){ return !m.deleted && m.name; }).sort(function(a, b){ return (a.regNo || 1e9) - (b.regNo || 1e9) || (a.createdAt || 0) - (b.createdAt || 0); });
    var alive = {}; list.forEach(function(m){ alive[m.id] = 1; });
    var items = [], ik = {}, got = {};
    D.s.filter(function(s){ return !s.deleted && alive[s.memberId]; }).forEach(function(s){
      var k = s.itemKey || s.item; if(!(k in ik)){ ik[k] = items.length; items.push(s.item || k); }
      got[s.memberId] = got[s.memberId] || []; if(got[s.memberId].indexOf(ik[k]) < 0) got[s.memberId].push(ik[k]);
    });
    var rows = list.map(function(m){ return JSON.stringify([m.regNo || 0, String(m.name).trim(), m.gender || "", got[m.id] || []]); });
    var d = new Date(), up = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    var body1 = "items: " + JSON.stringify(items) + ",\nmembers: [\n" + rows.join(",\n") + "\n]};\n";
    var ph = {}; D.p.forEach(function(p){ ph[p.id] = p; });
    var psig = hash(list.map(function(m){ var p = ph[m.id]; return (m.regNo || 0) + ":" + (p ? (p.pv || String(p.photo || "").length) : ""); }).join("|"));
    return { t1: "window.TIGER_PUBLIC = {\nupdated: " + JSON.stringify(up) + ",\n" + body1, s1: hash(body1), s2: psig,
      photos: async function(){
        var out = [];
        for(var i = 0; i < list.length; i++){
          var m = list[i], p = ph[m.id]; if(!p || !p.photo) continue;
          var key = m.id + "|" + (p.pv || String(p.photo).length);
          if(!thumbs[key]) thumbs[key] = await thumb(p.photo);
          if(thumbs[key]) out.push(JSON.stringify(m.regNo || 0) + ":" + JSON.stringify(thumbs[key]));
        }
        return "window.TIGER_PHOTOS = {\n" + out.join(",\n") + "\n};\n";
      } };
  }

  // ---------- GitHub-এ তোলা ----------
  function b64(s){ var u = new TextEncoder().encode(s), out = "", CH = 0x8000; for(var i = 0; i < u.length; i += CH) out += String.fromCharCode.apply(null, u.subarray(i, i + CH)); return btoa(out); }
  async function put(path, text){
    var H = { "Authorization": "Bearer " + get(LS.tok), "Accept": "application/vnd.github+json" };
    var url = "https://api.github.com/repos/" + REPO + "/contents/" + path, sha;
    var r = await fetch(url + "?ref=" + BR + "&t=" + Date.now(), { headers: H });
    if(r.status == 200) sha = (await r.json()).sha; else if(r.status == 401 || r.status == 403) throw new Error("টোকেন ঠিক নেই বা মেয়াদ শেষ");
    var body = { message: "সদস্য তালিকা স্বয়ংক্রিয় আপডেট (" + path + ")", content: b64(text), branch: BR }; if(sha) body.sha = sha;
    r = await fetch(url, { method: "PUT", headers: H, body: JSON.stringify(body) });
    if(!r.ok){ if(r.status == 401 || r.status == 403) throw new Error("টোকেন ঠিক নেই বা অনুমতি নেই"); throw new Error("GitHub সমস্যা (" + r.status + ")"); }
  }
  async function run(force){
    if(busy || !get(LS.tok) || !navigator.onLine) return;
    busy = true;
    try {
      var B = await build(await readDB()), did = [];
      if(force || B.s1 != get(LS.s1)){ await put("public.js", B.t1); set(LS.s1, B.s1); did.push("তালিকা"); }
      if(force || B.s2 != get(LS.s2)){ await put("photos.js", await B.photos()); set(LS.s2, B.s2); did.push("ছবি"); }
      if(did.length){ set(LS.at, String(Date.now())); lastMsg = "✅ " + did.join(" ও ") + " প্রকাশ হয়েছে — ১-২ মিনিটে ওয়েবসাইটে দেখাবে"; }
      else if(force) lastMsg = "নতুন কিছু নেই";
    } catch(e){ lastMsg = "❌ " + e.message; }
    busy = false; paint();
  }
  paint();
  setTimeout(function(){ run(false); }, 8000);
  setInterval(function(){ run(false); }, 60000);
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState == "hidden") run(false); });
})();
       
