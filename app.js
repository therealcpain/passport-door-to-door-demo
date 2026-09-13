/**
 * Passport Door-to-Door Reality — paste (1) application submit/mail date,
 * (2) service: routine / expedited, (3) optional trip date, (4) view date
 * → one shareable card: earliest → latest door-to-door mailbox arrival window
 * (processing + up to 2 weeks inbound mail + up to 2 weeks return mail).
 * Brand: Passport Door-to-Door Reality only. User paste only — never ask
 * passport number; no status scrape. Ranges only from travel.state.gov —
 * not a delivery guarantee. Pointers: travel.state.gov + passportstatus.state.gov only.
 * Hard-avoid paid expediter affiliates.
 */
(function () {
  "use strict";

  const TRAVEL_PROCESSING =
    "https://travel.state.gov/en/passports/apply/help/processing-time.html";
  const TRAVEL_GET_FAST =
    "https://travel.state.gov/en/passports/apply/get-fast.html";
  const PASSPORT_STATUS = "https://passportstatus.state.gov/";
  const THETRAVEL_PRESS =
    "https://www.thetravel.com/why-passport-renewal-surge-is-quietly-stretching-routine-waits-to-10-weeks-door-to-door/";

  /** Official processing windows (weeks) — travel.state.gov; mailing excluded. */
  const SERVICE = {
    routine: {
      id: "routine",
      label: "Routine",
      minWeeks: 4,
      maxWeeks: 6,
      rangeLabel: "4–6 weeks processing",
    },
    expedited: {
      id: "expedited",
      label: "Expedited",
      minWeeks: 2,
      maxWeeks: 3,
      rangeLabel: "2–3 weeks processing",
    },
  };

  const DAYS_PER_WEEK = 7;
  const MAIL_LEG_DAYS = 14; // up to 2 weeks each way (inbound + return)
  const URGENT_TRAVEL_DAYS = 14; // international travel within 14 calendar days → agency appointment

  const CITE_ONE_LINER =
    "travel.state.gov Get Your Processing Time: Routine 4–6 weeks; Expedited 2–3 weeks; published processing times do not include mailing — it may take up to 2 weeks for the application to arrive and up to 2 weeks for the passport to return by mail; urgent travel = passport agency appointment + proof of international travel within 14 calendar days. travel.state.gov Get Your Passport Fast (Last Updated May 12 2026): choose expedited if traveling in less than 6 weeks; routine if ≥6 weeks; both explicitly exclude mailing. TheTravel consumer press: published 4–6 week routine is agency review only — realistic door-to-door often longer once mail legs count (literacy only — not an invented backlog claim). Check passportstatus.state.gov for YOUR status. Ranges only — not a delivery guarantee.";

  const DISCLAIMER_SHORT =
    "Ranges only — not a delivery guarantee; mailing varies by area. We never invent personal passport status or guarantee a date. Check passportstatus.state.gov. Urgent international travel within 14 calendar days needs a passport-agency appointment (travel.state.gov). Not a paid expediter. travel.state.gov + passportstatus.state.gov only.";

  const MAIL_CHIP =
    "Published processing times do not include mailing (up to 2 weeks inbound + up to 2 weeks return)";

  const URGENT_STRIP =
    "Urgent travel: if you have international travel within 14 calendar days, contact / make a passport agency appointment (travel.state.gov Get Your Passport Fast) — do not rely on mail timing alone.";

  const FOOTER_POINTERS =
    "travel.state.gov processing times · travel.state.gov Get Your Passport Fast (updated May 12 2026) · passportstatus.state.gov — ranges only; mailing varies; not a delivery guarantee";

  /** Teaching seeds — labeled dates. Not live status scrapes. Never invent personal status. */
  const SEEDS = [
    {
      id: "aug20-routine-dec",
      label: "Aug 20 routine · Dec trip",
      sub: "Teaching · mailed Aug 20 · routine · trip Dec 20 · Likely",
      submitDate: "2026-08-20",
      service: "routine",
      tripDate: "2026-12-20",
      viewDate: "2026-09-13",
      noteLabel: "Aug 20 routine · Dec trip teaching seed",
    },
    {
      id: "aug20-expedited",
      label: "Aug 20 expedited",
      sub: "Teaching · expedited 2–3w processing · door-to-door + mail",
      submitDate: "2026-08-20",
      service: "expedited",
      tripDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Aug 20 expedited teaching seed",
    },
    {
      id: "tight-trip",
      label: "Tight trip · Oct 15",
      sub: "Teaching · Aug 20 routine · trip inside door-to-door window",
      submitDate: "2026-08-20",
      service: "routine",
      tripDate: "2026-10-15",
      viewDate: "2026-09-13",
      noteLabel: "Tight-trip teaching seed",
    },
    {
      id: "empty-miss",
      label: "Empty / missing dates",
      sub: "Teaching · blank submit → honest miss",
      submitDate: "",
      service: "routine",
      tripDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Empty-submit teaching seed",
    },
    {
      id: "mid-process",
      label: "View mid-process · Sep 13",
      sub: "Teaching · Aug 20 routine · view during processing window",
      submitDate: "2026-08-20",
      service: "routine",
      tripDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Mid-process view teaching seed",
    },
  ];

  const $ = (id) => document.getElementById(id);

  function parseISODate(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const parts = s.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (
      d.getFullYear() !== parts[0] ||
      d.getMonth() !== parts[1] - 1 ||
      d.getDate() !== parts[2]
    ) {
      return null;
    }
    return d;
  }

  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isoFromDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function todayISO() {
    return isoFromDate(new Date());
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  /** Whole calendar days from a → b (local). Positive if b is after a. */
  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  function serviceMeta(flag) {
    return SERVICE[flag] || null;
  }

  /**
   * Door-to-door math (documented in README):
   *   earliest = submit + minProcessingWeeks * 7   (optimistic; processing min; mail can overlap)
   *   latest   = submit + maxProcessingWeeks * 7 + 14 + 14
   * Processing-only window also shown for literacy.
   */
  function windowMath(submitDate, svc) {
    const minProcDays = svc.minWeeks * DAYS_PER_WEEK;
    const maxProcDays = svc.maxWeeks * DAYS_PER_WEEK;
    const earliest = addDays(submitDate, minProcDays);
    const latest = addDays(submitDate, maxProcDays + MAIL_LEG_DAYS + MAIL_LEG_DAYS);
    const procEarliest = addDays(submitDate, minProcDays);
    const procLatest = addDays(submitDate, maxProcDays);
    return {
      minProcDays: minProcDays,
      maxProcDays: maxProcDays,
      earliest: earliest,
      latest: latest,
      procEarliest: procEarliest,
      procLatest: procLatest,
      mailLegsDays: MAIL_LEG_DAYS + MAIL_LEG_DAYS,
      doorToDoorSpanDays: daysBetween(earliest, latest),
    };
  }

  /**
   * Trip conflict literacy (not a guarantee):
   *   Likely  — trip on/after latest door-to-door
   *   Tight   — trip between earliest and latest (inclusive of open interval)
   *   Unlikely — trip before earliest
   */
  function tripConflict(tripDate, earliest, latest) {
    if (!tripDate) return null;
    const toTripEarliest = daysBetween(earliest, tripDate);
    const toTripLatest = daysBetween(latest, tripDate);
    if (toTripLatest >= 0) {
      return {
        chip: "Likely",
        cls: "ok",
        line:
          "Trip " +
          fmtDate(tripDate) +
          " is on/after the latest door-to-door window (" +
          fmtDate(latest) +
          "). Literacy only — not a delivery guarantee; mailing varies.",
      };
    }
    if (toTripEarliest < 0) {
      return {
        chip: "Unlikely",
        cls: "danger",
        line:
          "Trip " +
          fmtDate(tripDate) +
          " is before the earliest door-to-door window (" +
          fmtDate(earliest) +
          "). Literacy only — not a guarantee; check passportstatus.state.gov / agency appointment if ≤14 days.",
      };
    }
    return {
      chip: "Tight",
      cls: "warn",
      line:
        "Trip " +
        fmtDate(tripDate) +
        " falls inside the earliest→latest door-to-door window (" +
        fmtDate(earliest) +
        " → " +
        fmtDate(latest) +
        "). Literacy only — not a delivery guarantee.",
    };
  }

  function urgentTravel(viewDate, tripDate) {
    if (!tripDate || !viewDate) {
      return {
        show: false,
        line: URGENT_STRIP,
      };
    }
    const days = daysBetween(viewDate, tripDate);
    if (days >= 0 && days <= URGENT_TRAVEL_DAYS) {
      return {
        show: true,
        days: days,
        line:
          "URGENT · international travel in " +
          days +
          " calendar day" +
          (days === 1 ? "" : "s") +
          " (≤14) → passport agency appointment path (travel.state.gov Get Your Passport Fast). Do not rely on mail alone.",
      };
    }
    return {
      show: false,
      days: days,
      line: URGENT_STRIP,
    };
  }

  function validate(input) {
    if (!parseISODate(input.viewDate)) {
      return "Pick a view date (the day you’re looking). Empty view date = honest miss — we will not invent a window.";
    }
    if (!parseISODate(input.submitDate)) {
      return "Paste your application submit / mail date. Empty submit date = honest miss — we will not invent earliest/latest.";
    }
    if (input.service !== "routine" && input.service !== "expedited") {
      return "Pick a service: Routine (4–6 weeks processing) or Expedited (2–3 weeks processing). Empty = honest miss.";
    }
    if (input.tripDate && !parseISODate(input.tripDate)) {
      return "Trip date looks invalid — clear it or paste YYYY-MM-DD. We will not invent a trip conflict.";
    }
    return null;
  }

  function compute(input) {
    const submitDate = parseISODate(input.submitDate);
    const viewDate = parseISODate(input.viewDate);
    const tripDate = input.tripDate ? parseISODate(input.tripDate) : null;
    const svc = serviceMeta(input.service);
    const win = windowMath(submitDate, svc);
    const conflict = tripConflict(tripDate, win.earliest, win.latest);
    const urgent = urgentTravel(viewDate, tripDate);

    const daysSinceSubmit = daysBetween(submitDate, viewDate);
    let phase = "window";
    if (daysSinceSubmit < 0) {
      phase = "future_submit";
    } else if (daysBetween(viewDate, win.earliest) > 0) {
      phase = "awaiting_earliest";
    } else if (daysBetween(viewDate, win.latest) >= 0) {
      phase = "inside_window";
    } else {
      phase = "past_latest";
    }

    const giant =
      fmtDate(win.earliest) + " → " + fmtDate(win.latest);
    const headline =
      "Door-to-door mailbox window: " + giant;
    // Pill = trip chip when present (Likely/Tight/Unlikely); else window label.
    // Do NOT duplicate giant dates into uppercase pill (hero owns earliest→latest).
    const pill = conflict
      ? "Trip " + conflict.chip
      : "Door-to-door window";
    const sub = conflict
      ? conflict.chip +
        " vs trip · " +
        svc.label +
        " · " +
        svc.rangeLabel +
        " + up to 2+2 weeks mail · literacy only — not a guarantee"
      : svc.label +
        " · " +
        svc.rangeLabel +
        " + up to 2+2 weeks mail · ranges only";

    let cls = "ok";
    if (conflict && conflict.cls === "danger") cls = "danger";
    else if (conflict && conflict.cls === "warn") cls = "warn";
    else if (urgent.show) cls = "warn";
    else if (phase === "past_latest") cls = "warn";

    const flag =
      "DOOR-TO-DOOR · earliest " +
      fmtDate(win.earliest) +
      " → latest " +
      fmtDate(win.latest) +
      " · processing-only " +
      fmtDate(win.procEarliest) +
      " → " +
      fmtDate(win.procLatest) +
      " (" +
      svc.rangeLabel +
      ") · mailing up to 2 weeks each way is NOT in published processing times · never invent personal status · not a delivery guarantee";

    const decoder =
      "Official " +
      svc.label +
      " processing is " +
      svc.rangeLabel +
      " (agency review). Published processing times do not include mailing — up to 2 weeks for the application to arrive and up to 2 weeks for the passport to return. This card’s earliest uses min processing days; latest adds max processing + 14 + 14 mail days. TheTravel-class explainers note realistic routine door-to-door often stretches past the headline 4–6 weeks once mail counts — literacy only, not an invented backlog claim.";

    const action =
      "Calm next step: check YOUR status at passportstatus.state.gov · read travel.state.gov processing times + Get Your Passport Fast (updated May 12 2026). If international travel is within 14 calendar days, pursue a passport agency appointment — do not rely on mail alone. This card never invents personal status and is not a paid expediter.";

    // Visual bar: fraction of door-to-door span from earliest→latest; mark view position
    const span = Math.max(1, daysBetween(win.earliest, win.latest));
    let viewPct = 0;
    if (daysBetween(viewDate, win.earliest) > 0) {
      viewPct = 0;
    } else if (daysBetween(win.latest, viewDate) > 0) {
      viewPct = 100;
    } else {
      viewPct = Math.max(
        0,
        Math.min(100, Math.round((daysBetween(win.earliest, viewDate) / span) * 100))
      );
    }

    return {
      submitDate: submitDate,
      submitDateISO: input.submitDate,
      viewDate: viewDate,
      viewDateISO: input.viewDate,
      tripDate: tripDate,
      tripDateISO: input.tripDate || "",
      service: input.service,
      serviceLabel: svc.label,
      serviceRange: svc.rangeLabel,
      earliest: win.earliest,
      latest: win.latest,
      procEarliest: win.procEarliest,
      procLatest: win.procLatest,
      minProcDays: win.minProcDays,
      maxProcDays: win.maxProcDays,
      mailLegsDays: win.mailLegsDays,
      giant: giant,
      headline: headline,
      pill: pill,
      sub: sub,
      cls: cls,
      phase: phase,
      flag: flag,
      mailChip: MAIL_CHIP,
      urgent: urgent,
      conflict: conflict,
      footerPointers: FOOTER_POINTERS,
      decoder: decoder,
      action: action,
      viewPct: viewPct,
      daysSinceSubmit: daysSinceSubmit,
      noteLabel: (input.noteLabel || "").trim(),
      cite: CITE_ONE_LINER,
      disclaimer: DISCLAIMER_SHORT,
    };
  }

  function readInputs() {
    return {
      submitDate: ($("submitDate").value || "").trim(),
      service: $("service").value || "",
      tripDate: ($("tripDate").value || "").trim(),
      viewDate: ($("viewDate").value || "").trim(),
      noteLabel: ($("noteLabel").value || "").trim(),
    };
  }

  function applyInputs(p) {
    $("submitDate").value = p.submitDate || "";
    $("service").value = p.service || "";
    $("tripDate").value = p.tripDate || "";
    $("viewDate").value = p.viewDate || "";
    $("noteLabel").value = p.noteLabel || "";
  }

  function encodeHash(input) {
    try {
      const payload = {
        s: input.submitDate,
        svc: input.service,
        t: input.tripDate || "",
        v: input.viewDate,
        n: input.noteLabel || "",
      };
      return "#p=" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (e) {
      return "";
    }
  }

  function decodeHash() {
    const h = location.hash || "";
    const m = h.match(/#p=([A-Za-z0-9+/=]+)/);
    if (!m) return null;
    try {
      const raw = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      return {
        submitDate: raw.s || "",
        service: raw.svc || "",
        tripDate: raw.t || "",
        viewDate: raw.v || "",
        noteLabel: raw.n || "",
      };
    } catch (e) {
      return null;
    }
  }

  function setStatus(msg, isErr) {
    const el = $("status");
    el.textContent = msg || "";
    el.className = "status" + (isErr ? " err" : "");
  }

  function renderCard() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      $("cardSection").hidden = true;
      setStatus(err, true);
      return null;
    }
    const c = compute(input);
    $("cardSection").hidden = false;
    setStatus("");

    $("cardMeta").textContent =
      (c.noteLabel ? c.noteLabel + " · " : "") +
      "Submitted " +
      fmtDate(c.submitDate) +
      " · " +
      c.serviceLabel +
      " · View " +
      fmtDate(c.viewDate) +
      (c.tripDate ? " · Trip " + fmtDate(c.tripDate) : "");

    $("dlHeadline").textContent = c.headline;
    $("statusPill").textContent = c.pill;
    $("statusPill").className = "verdict-k " + (c.cls || "");
    $("statusSub").textContent = c.sub;
    $("statusBadge").className = "verdict";

    $("earliestDisp").textContent = fmtDate(c.earliest);
    $("latestDisp").textContent = fmtDate(c.latest);
    $("windowGiant").textContent = c.giant;
    $("procOnlyLine").textContent =
      "Processing-only: " +
      fmtDate(c.procEarliest) +
      " → " +
      fmtDate(c.procLatest) +
      " (" +
      c.serviceRange +
      ")";
    $("doorLine").textContent =
      "Door-to-door (incl. up to 2+2 weeks mail): " +
      fmtDate(c.earliest) +
      " → " +
      fmtDate(c.latest);

    $("timelineBar").style.setProperty("--pct", String(c.viewPct));
    $("timelineLabel").textContent =
      "View " +
      fmtDate(c.viewDate) +
      " · " +
      c.daysSinceSubmit +
      " day" +
      (c.daysSinceSubmit === 1 ? "" : "s") +
      " since submit · bar marks view inside earliest→latest span";

    $("actionFlag").textContent = c.flag;
    $("actionFlag").className = "look-enroll-flag " + (c.cls || "");
    $("mailChipStrip").textContent = c.mailChip;
    $("mailChipStrip").className = "mail-chip";

    const urgentEl = $("urgentStrip");
    urgentEl.textContent = c.urgent.line;
    urgentEl.className =
      "look-enroll-flag" + (c.urgent.show ? " warn" : "");

    const tripEl = $("tripConflictStrip");
    if (c.conflict) {
      tripEl.hidden = false;
      tripEl.textContent =
        "Trip vs window: " + c.conflict.chip + " — " + c.conflict.line;
      tripEl.className = "look-enroll-flag " + (c.conflict.cls || "");
    } else {
      tripEl.hidden = true;
      tripEl.textContent = "";
    }

    $("pointerStrip").textContent = c.footerPointers;

    $("rSubmit").textContent = fmtDate(c.submitDate);
    $("rService").textContent = c.serviceLabel + " · " + c.serviceRange;
    $("rTrip").textContent = c.tripDate
      ? fmtDate(c.tripDate) +
        (c.conflict ? " · " + c.conflict.chip : "")
      : "— (optional)";
    $("rView").textContent = fmtDate(c.viewDate);
    $("rWindow").textContent = c.giant;

    $("decoderLine").textContent = c.decoder;
    $("actionLine").textContent = c.action;
    $("citeLine").textContent = c.cite;

    const hash = encodeHash(input);
    if (hash) {
      history.replaceState(null, "", hash);
      $("shareUrl").value = location.href.split("#")[0] + hash;
      $("shareBox").hidden = false;
    }

    return c;
  }

  function clearAll() {
    $("submitDate").value = "";
    $("service").value = "";
    $("tripDate").value = "";
    $("viewDate").value = "";
    $("noteLabel").value = "";
    $("cardSection").hidden = true;
    $("shareBox").hidden = true;
    setStatus("");
    history.replaceState(null, "", location.pathname + location.search);
  }

  function summaryText(c) {
    const lines = [
      "Passport Door-to-Door Reality",
      c.giant,
      c.sub,
      "Submit/mail: " + fmtDate(c.submitDate),
      "Service: " + c.serviceLabel + " · " + c.serviceRange,
      "Processing-only: " +
        fmtDate(c.procEarliest) +
        " → " +
        fmtDate(c.procLatest),
      "Door-to-door (incl. up to 2+2 weeks mail): " +
        fmtDate(c.earliest) +
        " → " +
        fmtDate(c.latest),
      c.mailChip,
    ];
    if (c.tripDate && c.conflict) {
      lines.push("Trip " + fmtDate(c.tripDate) + ": " + c.conflict.chip);
    }
    if (c.urgent.show) lines.push(c.urgent.line);
    lines.push(c.footerPointers);
    lines.push(DISCLAIMER_SHORT);
    lines.push(
      "Cite: travel.state.gov processing-time · get-fast (May 12 2026) · passportstatus.state.gov"
    );
    return lines.join("\n");
  }

  function copySummary() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      setStatus(err, true);
      return;
    }
    const c = compute(input);
    navigator.clipboard.writeText(summaryText(c)).then(
      function () {
        setStatus("Summary copied.");
      },
      function () {
        setStatus("Clipboard blocked — select share URL instead.", true);
      }
    );
  }

  function shareLink() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      setStatus(err, true);
      return;
    }
    renderCard();
    const url = $("shareUrl").value;
    if (navigator.share) {
      navigator
        .share({
          title: "Passport Door-to-Door Reality",
          text: "Paste your passport mail date — earliest/latest mailbox window (processing ≠ mailing)",
          url: url,
        })
        .catch(function () {
          setStatus("Share canceled.");
        });
    } else {
      navigator.clipboard.writeText(url).then(
        function () {
          setStatus("Share link copied.");
        },
        function () {
          setStatus("Copy the share URL from the box.", true);
        }
      );
    }
  }

  function copyShare() {
    const url = $("shareUrl").value;
    navigator.clipboard.writeText(url).then(
      function () {
        setStatus("Share link copied.");
      },
      function () {
        setStatus("Clipboard blocked.", true);
      }
    );
  }

  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(/\s+/);
    let line = "";
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y);
        y += lineH;
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, y);
      y += lineH;
    }
    return y;
  }

  function exportPng() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      setStatus(err, true);
      return;
    }
    const c = compute(input);
    const canvas = $("pngCanvas");
    const ctx = canvas.getContext("2d");
    const W = 900;
    const H = 1280;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#7eb8e8");
    grad.addColorStop(0.5, "#f0b429");
    grad.addColorStop(1, "#3ecf8e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 8);

    let y = 56;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "600 16px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("Passport Door-to-Door Reality", 48, y);

    y += 40;
    ctx.fillStyle = "#e8eef4";
    ctx.font = "700 28px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, "Earliest → latest mailbox window", 48, y, W - 96, 34);

    y += 12;
    ctx.fillStyle =
      c.cls === "ok"
        ? "#3ecf8e"
        : c.cls === "warn"
          ? "#f0b429"
          : "#f07178";
    ctx.font = "700 42px IBM Plex Mono, ui-monospace, monospace";
    y = wrapText(ctx, c.giant, 48, y, W - 96, 48);

    y += 20;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 18px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.sub, 48, y, W - 96, 26);

    y += 24;
    ctx.fillStyle = "#7eb8e8";
    ctx.font = "600 16px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.mailChip, 48, y, W - 96, 24);

    y += 20;
    ctx.fillStyle = "#e8eef4";
    ctx.font = "400 16px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(
      ctx,
      "Processing-only: " +
        fmtDate(c.procEarliest) +
        " → " +
        fmtDate(c.procLatest) +
        " · Door-to-door: " +
        fmtDate(c.earliest) +
        " → " +
        fmtDate(c.latest),
      48,
      y,
      W - 96,
      24
    );

    y += 16;
    ctx.fillStyle = "#e8eef4";
    ctx.font = "400 16px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(
      ctx,
      "Submit " +
        fmtDate(c.submitDate) +
        " · " +
        c.serviceLabel +
        " · View " +
        fmtDate(c.viewDate) +
        (c.tripDate ? " · Trip " + fmtDate(c.tripDate) : ""),
      48,
      y,
      W - 96,
      24
    );

    if (c.conflict) {
      y += 16;
      ctx.fillStyle =
        c.conflict.cls === "ok"
          ? "#3ecf8e"
          : c.conflict.cls === "warn"
            ? "#f0b429"
            : "#f07178";
      ctx.font = "700 18px IBM Plex Sans, system-ui, sans-serif";
      y = wrapText(
        ctx,
        "Trip vs window: " + c.conflict.chip,
        48,
        y,
        W - 96,
        24
      );
    }

    if (c.urgent.show) {
      y += 16;
      ctx.fillStyle = "#f0b429";
      ctx.font = "600 16px IBM Plex Sans, system-ui, sans-serif";
      y = wrapText(ctx, c.urgent.line, 48, y, W - 96, 22);
    }

    y += 28;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 14px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.footerPointers, 48, y, W - 96, 20);

    y += 20;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 13px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(
      ctx,
      "Cite: travel.state.gov processing-time · get-fast (May 12 2026) · passportstatus.state.gov",
      48,
      y,
      W - 96,
      18
    );

    y += 28;
    ctx.fillStyle = "#f07178";
    ctx.font = "600 14px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, DISCLAIMER_SHORT, 48, y, W - 96, 20);

    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 12px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText(
      "User-pasted dates only · never invent personal status · no passport number · no expediter affiliate",
      48,
      H - 36
    );

    canvas.toBlob(function (blob) {
      if (!blob) {
        $("status").textContent = "PNG export failed.";
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        "passport-door-to-door-" +
        (input.service || "svc") +
        "-" +
        (input.submitDate || "submit") +
        ".png";
      a.click();
      URL.revokeObjectURL(a.href);
      $("status").textContent = "PNG downloaded.";
    });
  }

  function renderChips() {
    const wrap = $("seedChips");
    wrap.innerHTML = "";
    SEEDS.forEach(function (s) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seed-chip";
      btn.setAttribute("role", "listitem");
      btn.innerHTML =
        s.label + '<span class="chip-sub">' + s.sub + "</span>";
      btn.addEventListener("click", function () {
        applyInputs({
          submitDate: s.submitDate,
          service: s.service,
          tripDate: s.tripDate,
          viewDate: s.viewDate,
          noteLabel: s.noteLabel,
        });
        if (!s.submitDate || !s.viewDate) {
          $("cardSection").hidden = true;
          setStatus(
            "Paste your application submit / mail date. Empty submit date = honest miss — we will not invent earliest/latest.",
            true
          );
          return;
        }
        renderCard();
      });
      wrap.appendChild(btn);
    });
  }

  function renderSources() {
    const el = $("sourceLinks");
    el.innerHTML =
      "<strong>Sources</strong> · " +
      '<a href="' +
      TRAVEL_PROCESSING +
      '" target="_blank" rel="noopener noreferrer">travel.state.gov processing times</a> · ' +
      '<a href="' +
      TRAVEL_GET_FAST +
      '" target="_blank" rel="noopener noreferrer">Get Your Passport Fast (May 12 2026)</a> · ' +
      '<a href="' +
      PASSPORT_STATUS +
      '" target="_blank" rel="noopener noreferrer">passportstatus.state.gov</a> · ' +
      '<a href="' +
      THETRAVEL_PRESS +
      '" target="_blank" rel="noopener noreferrer">TheTravel door-to-door press (literacy)</a>';
  }

  function bind() {
    if (!$("viewDate").value) $("viewDate").value = todayISO();
    renderChips();
    renderSources();

    $("cardBtn").addEventListener("click", renderCard);
    $("clearBtn").addEventListener("click", clearAll);
    $("copySummary").addEventListener("click", copySummary);
    $("shareBtn").addEventListener("click", shareLink);
    $("copyShare").addEventListener("click", copyShare);
    $("pngBtn").addEventListener("click", exportPng);

    window.addEventListener("hashchange", function () {
      const p = decodeHash();
      if (p) {
        applyInputs(p);
        renderCard();
      }
    });

    const fromHash = decodeHash();
    if (fromHash) {
      applyInputs(fromHash);
      renderCard();
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      SEEDS: SEEDS,
      SERVICE: SERVICE,
      DAYS_PER_WEEK: DAYS_PER_WEEK,
      MAIL_LEG_DAYS: MAIL_LEG_DAYS,
      URGENT_TRAVEL_DAYS: URGENT_TRAVEL_DAYS,
      parseISODate: parseISODate,
      addDays: addDays,
      daysBetween: daysBetween,
      windowMath: windowMath,
      tripConflict: tripConflict,
      urgentTravel: urgentTravel,
      serviceMeta: serviceMeta,
      validate: validate,
      compute: compute,
      fmtDate: fmtDate,
      DISCLAIMER_SHORT: DISCLAIMER_SHORT,
      CITE_ONE_LINER: CITE_ONE_LINER,
      MAIL_CHIP: MAIL_CHIP,
      URGENT_STRIP: URGENT_STRIP,
      FOOTER_POINTERS: FOOTER_POINTERS,
    };
  }
})();
