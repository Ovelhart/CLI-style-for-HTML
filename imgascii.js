(function () {
  "use strict";

  const DEFAULTS = {
    width: 80,
    height: null,
    charset: "standard",
    color: false,
    invert: false,
    tone: null,
    fontSize: "1em",
    lineHeight: 1.0,
    bg: "transparent",
    maxWidth: 500,
    maxHeight: 300,
    alphaMode: "cutoff",
    blendBg: "#000000",
  };

  function getConfig() {
    return Object.assign({}, DEFAULTS, window.imgasciiConfig || {});
  }

  const CHARSETS = {
    standard: "@%#*+=-:. ",
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\'. ',
    blocks: "█▓▒░ ",
    minimal: "@#. ",
    braille: "⠿⠾⠽⠼⠻⠺⠹⠸⠷⠶⠵⠴⠳⠲⠱⠰⠯⠮⠭⠬⠫⠪⠩⠨⠧⠦⠥⠤⠣⠢⠡⠠⠟⠞⠝⠜⠛⠚⠙⠘⠗⠖⠕⠔⠓⠒⠑⠐⠏⠎⠍⠌⠋⠊⠉⠈⠇⠆⠅⠄⠃⠂⠁ ",
  };

  let _globalNoColor = false;
  let _globalTone = null;
  const _rendered = new Map();

  function _obterStyleSheet() {
    const ID = "__imgascii-styles__";
    let el = document.getElementById(ID);
    if (!el) {
      el = document.createElement("style");
      el.id = ID;
      document.head.appendChild(el);
    }
    return el.sheet;
  }

  const _colorCache = {};
  function _cssParaRgb(cor) {
    if (_colorCache[cor]) return _colorCache[cor];
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const ctx = c.getContext("2d");
      ctx.fillStyle = cor;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      _colorCache[cor] = [d[0], d[1], d[2]];
    } catch (_) {
      _colorCache[cor] = [128, 128, 128];
    }
    return _colorCache[cor];
  }

  function _luminancia([r, g, b]) {
    return [r, g, b].reduce((sum, v, i) => {
      v /= 255;
      v = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      return sum + v * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  }

  function _textoParaSelection(corFundo) {
    return _luminancia(_cssParaRgb(corFundo)) > 0.35 ? "#111111" : "#ffffff";
  }

  const _selClassesRegistradas = new Set();

  function _registrarSelectionRule(sheet, chave, corFundo) {
    const classe = `ia-sel-${chave}`;
    if (_selClassesRegistradas.has(classe)) return classe;

    const corTexto = _textoParaSelection(corFundo);
    const regra = `.${classe}::selection { background-color:${corFundo}; color:${corTexto}; }`;

    try {
      sheet.insertRule(regra, sheet.cssRules.length);
    } catch (_) {
      const styleEl = document.getElementById("__imgascii-styles__");
      if (styleEl) styleEl.textContent += regra;
    }

    _selClassesRegistradas.add(classe);
    return classe;
  }

  function _aplicarSelection(pre, corTom) {
    [...pre.classList].filter(c => c.startsWith("ia-sel-")).forEach(c => pre.classList.remove(c));

    if (!corTom) return;

    const sheet = _obterStyleSheet();
    const chave = corTom.replace(/[^a-z0-9]/gi, "_");
    const classe = _registrarSelectionRule(sheet, chave, corTom);
    pre.classList.add(classe);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseFontSize(raw, fallback) {
    if (!raw) return fallback || "1em";
    const v = String(raw).trim();
    return /^\d+(\.\d+)?$/.test(v) ? v + "px" : v;
  }

  function _hexParaRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3
      ? h.split("").map(c => c + c).join("")
      : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function imageToAscii(img, options) {
    const cfg = getConfig();

    const width = options.width ?? cfg.width;
    const height = options.height ?? cfg.height;
    const color = options.color ?? cfg.color;
    const charset = options.charset ?? cfg.charset;
    const invert = options.invert ?? cfg.invert;
    const effectiveTone = options.effectiveTone ?? null;
    const alphaMode = options.alphaMode ?? cfg.alphaMode;
    const blendBg = options.blendBg ?? cfg.blendBg;
    const maxW = options.maxWidth ?? cfg.maxWidth;
    const maxH = options.maxHeight ?? cfg.maxHeight;

    const chars = Object.prototype.hasOwnProperty.call(CHARSETS, charset)
      ? CHARSETS[charset]
      : String(charset);

    if (chars.length < 2) {
      console.warn("[imgascii] charset precisa de ao menos 2 caracteres.");
    }

    const lastIdx = chars.length - 1;

    const cols = Math.max(10, Math.min(maxW, parseInt(width, 10) || cfg.width));
    const rows = height
      ? Math.max(5, Math.min(maxH, parseInt(height, 10)))
      : Math.min(maxH, Math.round(cols * (img.naturalHeight / img.naturalWidth) * 0.45));

    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cols, rows);
    ctx.drawImage(img, 0, 0, cols, rows);

    const pixels = ctx.getImageData(0, 0, cols, rows).data;

    let blendR = 0, blendG = 0, blendB = 0;
    if (alphaMode === "blend") {
      try {
        [blendR, blendG, blendB] = _hexParaRgb(blendBg);
      } catch (_) { }
    }

    const lines = [];

    for (let row = 0; row < rows; row++) {
      let line = "";

      for (let col = 0; col < cols; col++) {
        const i = (row * cols + col) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 16) {
          line += " ";
          continue;
        }

        let brightness, finalR = r, finalG = g, finalB = b, opacityAttr = "";

        if (alphaMode === "opacity") {
          brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const op = (a / 255).toFixed(3);
          opacityAttr = op < 1 ? `opacity:${op};` : "";

        } else if (alphaMode === "blend") {
          const af = a / 255;
          finalR = Math.round(r * af + blendR * (1 - af));
          finalG = Math.round(g * af + blendG * (1 - af));
          finalB = Math.round(b * af + blendB * (1 - af));
          brightness = (0.299 * finalR + 0.587 * finalG + 0.114 * finalB) / 255;

        } else {
          const af = a / 255;
          brightness = (0.299 * r + 0.587 * g + 0.114 * b) * af / 255;
        }

        let ci = invert
          ? Math.round(brightness * lastIdx)
          : Math.round((1 - brightness) * lastIdx);
        ci = Math.max(0, Math.min(lastIdx, ci));

        const ch = chars[ci];

        if (ch === " ") {
          line += " ";
          continue;
        }

        const esc = escapeHtml(ch);

        if (color && !effectiveTone) {
          const styleAttr = opacityAttr
            ? `style="color:rgb(${finalR},${finalG},${finalB});${opacityAttr}"`
            : `style="color:rgb(${finalR},${finalG},${finalB})"`;
          line += `<span ${styleAttr}>${esc}</span>`;

        } else if (opacityAttr && !effectiveTone) {
          line += `<span style="${opacityAttr}">${esc}</span>`;

        } else {
          line += esc;
        }
      }

      lines.push(line);
    }

    return lines.join("\n");
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const attempt = (withCors) => {
        const img = new Image();
        if (withCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => withCors
          ? attempt(false)
          : reject(new Error(`Não foi possível carregar: ${url}`));
        img.src = url;
      };
      attempt(true);
    });
  }

  async function processElement(el) {
    if (el._imgasciiDone) return;
    el._imgasciiDone = true;

    const cfg = getConfig();

    const url = el.getAttribute("url");
    if (!url) {
      const errSpan = document.createElement("span");
      errSpan.style.color = "#f55";
      errSpan.textContent = "[imgascii] atributo 'url' é obrigatório";
      el.parentNode && el.parentNode.replaceChild(errSpan, el);
      return;
    }

    const rawBg = el.getAttribute("bg");
    const rawFs = el.getAttribute("font-size");
    const rawLH = el.getAttribute("line-height");
    const wantsColor = el.hasAttribute("color") ? el.getAttribute("color") === "true" : cfg.color;
    const noColorTag = el.getAttribute("nocolor") === "true";
    const toneTag = el.getAttribute("tone") || cfg.tone || null;
    const alphaMode = el.getAttribute("alpha-mode") || cfg.alphaMode;
    const blendBg = el.getAttribute("blend-bg") || cfg.blendBg;
    const extraClass = el.getAttribute("class") || "";

    const maxW = el.hasAttribute("max-width") ? parseInt(el.getAttribute("max-width"), 10) : cfg.maxWidth;
    const maxH = el.hasAttribute("max-height") ? parseInt(el.getAttribute("max-height"), 10) : cfg.maxHeight;

    const baseOptions = {
      width: el.getAttribute("width") || cfg.width,
      height: el.getAttribute("height") || cfg.height,
      wantsColor: wantsColor,
      charset: el.getAttribute("charset") || cfg.charset,
      invert: el.hasAttribute("invert") ? el.getAttribute("invert") === "true" : cfg.invert,
      noColorTag: noColorTag,
      toneTag: toneTag,
      alphaMode: alphaMode,
      blendBg: blendBg,
      maxWidth: maxW,
      maxHeight: maxH,
    };

    const effectiveTone = toneTag || _globalTone || null;
    const options = Object.assign({}, baseOptions, {
      color: wantsColor && !noColorTag && !_globalNoColor,
      effectiveTone: effectiveTone,
    });

    const pre = document.createElement("pre");
    if (extraClass) pre.className = extraClass;

    const bgValue = rawBg || cfg.bg;
    const textColor = effectiveTone || "inherit";

    pre.style.cssText = [
      "display:inline-block",
      `background:${bgValue}`,
      `color:${textColor}`,
      "font-family:'Courier New',Courier,monospace",
      `font-size:${parseFontSize(rawFs, cfg.fontSize)}`,
      `line-height:${rawLH ? parseFloat(rawLH) : cfg.lineHeight}`,
      "letter-spacing:0",
      "word-spacing:0",
      "margin:0",
      "padding:0",
      "border:none",
      "white-space:pre",
      "overflow:visible",
      "tab-size:1",
      "-moz-tab-size:1",
    ].join(";");

    _aplicarSelection(pre, effectiveTone);

    pre.textContent = "…";

    if (el.parentNode) {
      el.parentNode.replaceChild(pre, el);
    }

    try {
      const img = await loadImage(url);
      pre.innerHTML = imageToAscii(img, options);
      _rendered.set(pre, { img, baseOptions, rawBg, rawFs, rawLH });
    } catch (err) {
      pre.style.color = "#f55";
      pre.textContent = `[imgascii] ${err.message}`;
    }
  }

  function reRenderAll() {
    _rendered.forEach(({ img, baseOptions, rawBg, rawFs, rawLH }, pre) => {
      const effectiveTone = baseOptions.toneTag || _globalTone || null;
      const opts = Object.assign({}, baseOptions, {
        color: baseOptions.wantsColor && !baseOptions.noColorTag && !_globalNoColor,
        effectiveTone: effectiveTone,
      });

      pre.style.color = effectiveTone || "inherit";
      _aplicarSelection(pre, effectiveTone);

      pre.innerHTML = imageToAscii(img, opts);
    });
  }

  function processAll() {
    document.querySelectorAll("imgascii").forEach(processElement);
  }

  function observeDom() {
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!node || node.nodeType !== 1) continue;
          if (node.nodeName.toLowerCase() === "imgascii") processElement(node);
          if (node.querySelectorAll) {
            node.querySelectorAll("imgascii").forEach(processElement);
          }
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  window.imgascii = {

    refresh: processAll,

    get config() { return Object.assign({}, DEFAULTS, window.imgasciiConfig || {}); },

    setNoColor: function (val) {
      _globalNoColor = !!val;
      reRenderAll();
    },

    get noColor() { return _globalNoColor; },

    setGlobalTone: function (cor) {
      _globalTone = cor || null;
      reRenderAll();
    },

    get globalTone() { return _globalTone; },

    convert: async function (url, opts = {}) {
      const img = await loadImage(url);
      return imageToAscii(img, opts);
    },

    render: async function (target, url, opts = {}) {
      const el = typeof target === "string"
        ? document.querySelector(target)
        : target;
      if (!el) throw new Error(`[imgascii] Elemento não encontrado: ${target}`);
      const img = await loadImage(url);
      el.innerHTML = imageToAscii(img, opts);
    },

    charsets: CHARSETS,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { processAll(); observeDom(); });
  } else {
    processAll();
    observeDom();
  }

})();
