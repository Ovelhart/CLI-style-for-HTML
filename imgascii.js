/**
 * imgascii.js — Converte imagens em arte ASCII via tag customizada <imgascii>
 * Compatível com cor-tags.js
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  CONFIGURAÇÕES GLOBAIS — edite CONFIG para definir padrões de todas as tags │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 *  window.imgasciiConfig = {
 *    width:       80,          // colunas padrão
 *    height:      null,        // linhas padrão (null = proporcional)
 *    charset:     "standard",  // charset padrão
 *    color:       false,       // colorido por padrão?
 *    invert:      false,       // inverter brilho por padrão?
 *    tone:        null,        // cor CSS monocromática padrão (null = herda do pai)
 *    fontSize:    "1em",       // font-size CSS padrão
 *    lineHeight:  1.0,         // line-height padrão
 *    bg:          "transparent", // fundo padrão
 *    maxWidth:    500,         // limite máximo de colunas (proteção)
 *    maxHeight:   300,         // limite máximo de linhas (proteção)
 *    alphaMode:   "cutoff",    // como lidar com alpha:
 *                              //   "cutoff"  — pixel com a<16 → espaço (padrão)
 *                              //   "opacity" — usa CSS opacity proporcional ao alpha
 *                              //   "blend"   — mistura cor do pixel com o fundo
 *    blendBg:     "#000000",   // cor de fundo para alphaMode:"blend"
 *  };
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  ATRIBUTOS DA TAG <imgascii>                                                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 *   url          (obrigatório) — URL ou caminho da imagem (png, jpg, webp, gif…)
 *   width        — Largura em colunas (padrão: config.width)
 *   height       — Altura em linhas; omita para proporcional automático
 *   max-width    — Limite máximo de colunas para esta tag (sobrescreve config.maxWidth)
 *   max-height   — Limite máximo de linhas para esta tag (sobrescreve config.maxHeight)
 *   color        — "true" para ASCII colorido com spans RGB
 *   nocolor      — "true" força monocromático mesmo com color="true"
 *   tone         — Cor CSS do texto monocromático: "red", "#0f0", "rgb(0,200,255)"
 *   charset      — standard | detailed | blocks | minimal | braille | string custom
 *   invert       — "true" inverte o mapa de brilho (útil p/ fundo claro)
 *   alpha-mode   — "cutoff" | "opacity" | "blend" — como lidar com transparência
 *   blend-bg     — cor de fundo para alpha-mode="blend" (padrão: "#000000")
 *   font-size    — Tamanho da fonte CSS: "8px", "0.6em", "10pt" ou só "8" → "8px"
 *   line-height  — Espaçamento entre linhas (padrão: 1.0)
 *   bg           — Cor de fundo CSS do bloco (padrão: transparent)
 *   class        — Classes CSS extras para o elemento gerado
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  API PÚBLICA  window.imgascii                                               │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 *   .refresh()                      — Reprocessa todos os <imgascii> do DOM
 *   .convert(url, opts)             — Promise<htmlString>
 *   .render(seletor|el, url, opts)  — Renderiza num elemento existente
 *   .charsets                       — Objeto com os charsets embutidos
 *   .config                         — Referência ao objeto de configuração global
 *   .setNoColor(bool)               — Ativa/desativa cores globalmente + re-renderiza
 *   .noColor                        — Estado atual (boolean)
 *   .setGlobalTone(cor|null)        — Tom monocromático global + re-renderiza
 *   .globalTone                     — Tom global atual (string CSS ou null)
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  SELECTION (compatível com cor-tags.js)                                     │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *   A seleção de texto do ASCII herda a cor da tag — exatamente como cor-tags.js.
 *   Se tone ou globalTone estiver ativo, a cor de ::selection usa esse tom.
 *   O texto de seleção é calculado automaticamente (claro/escuro por luminância).
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════════
  //  CONFIGURAÇÕES GLOBAIS — podem ser sobrescritas via window.imgasciiConfig
  // ═══════════════════════════════════════════════════════════════════════════════
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
    alphaMode: "cutoff",   // "cutoff" | "opacity" | "blend"
    blendBg: "#000000",
  };

  // Mescla config do usuário (definida antes do script) com os defaults
  function getConfig() {
    return Object.assign({}, DEFAULTS, window.imgasciiConfig || {});
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  CHARSETS — do mais escuro ao mais claro
  // ═══════════════════════════════════════════════════════════════════════════════
  const CHARSETS = {
    standard: "@%#*+=-:. ",
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^\'. ',
    blocks: "█▓▒░ ",
    minimal: "@#. ",
    braille: "⠿⠾⠽⠼⠻⠺⠹⠸⠷⠶⠵⠴⠳⠲⠱⠰⠯⠮⠭⠬⠫⠪⠩⠨⠧⠦⠥⠤⠣⠢⠡⠠⠟⠞⠝⠜⠛⠚⠙⠘⠗⠖⠕⠔⠓⠒⠑⠐⠏⠎⠍⠌⠋⠊⠉⠈⠇⠆⠅⠄⠃⠂⠁ ",
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  //  ESTADO GLOBAL
  // ═══════════════════════════════════════════════════════════════════════════════
  let _globalNoColor = false;
  let _globalTone = null;
  // Mapa: pre → { img, baseOptions } para re-renderizar sem recarregar
  const _rendered = new Map();

  // ═══════════════════════════════════════════════════════════════════════════════
  //  SELECTION — sistema idêntico ao cor-tags.js
  // ═══════════════════════════════════════════════════════════════════════════════
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

  // Converte qualquer cor CSS para [r,g,b] usando um canvas 1×1
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

  // Aplica (ou atualiza) classe de selection num <pre>
  function _aplicarSelection(pre, corTom) {
    // Remove classes de selection antigas
    [...pre.classList].filter(c => c.startsWith("ia-sel-")).forEach(c => pre.classList.remove(c));

    if (!corTom) return; // sem tom → herda selection do pai (cor-tags.js cuida)

    const sheet = _obterStyleSheet();
    // Gera chave segura para nome de classe
    const chave = corTom.replace(/[^a-z0-9]/gi, "_");
    const classe = _registrarSelectionRule(sheet, chave, corTom);
    pre.classList.add(classe);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════
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

  // Parseia uma cor hex "#rrggbb" → [r,g,b]
  function _hexParaRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3
      ? h.split("").map(c => c + c).join("")
      : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  NÚCLEO: imagem → HTML
  // ═══════════════════════════════════════════════════════════════════════════════
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

    // Dimensões com limite configurável
    const cols = Math.max(10, Math.min(maxW, parseInt(width, 10) || cfg.width));
    const rows = height
      ? Math.max(5, Math.min(maxH, parseInt(height, 10)))
      : Math.min(maxH, Math.round(cols * (img.naturalHeight / img.naturalWidth) * 0.45));

    // Canvas off-screen
    const canvas = document.createElement("canvas");
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cols, rows);
    ctx.drawImage(img, 0, 0, cols, rows);

    const pixels = ctx.getImageData(0, 0, cols, rows).data;

    // Para blend: pré-parse da cor de fundo
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

        // ── Pixel totalmente transparente → espaço ─────────────────────────
        if (a < 16) {
          line += " ";
          continue;
        }

        // ── Calcula luminância de acordo com alphaMode ─────────────────────
        let brightness, finalR = r, finalG = g, finalB = b, opacityAttr = "";

        if (alphaMode === "opacity") {
          // Brilho da cor sólida; a transparência vai como CSS opacity
          brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const op = (a / 255).toFixed(3);
          opacityAttr = op < 1 ? `opacity:${op};` : "";

        } else if (alphaMode === "blend") {
          // Mistura RGB do pixel com a cor de fundo
          const af = a / 255;
          finalR = Math.round(r * af + blendR * (1 - af));
          finalG = Math.round(g * af + blendG * (1 - af));
          finalB = Math.round(b * af + blendB * (1 - af));
          brightness = (0.299 * finalR + 0.587 * finalG + 0.114 * finalB) / 255;

        } else {
          // cutoff (padrão): alpha parcial afeta luminância mas não a cor
          const af = a / 255;
          brightness = (0.299 * r + 0.587 * g + 0.114 * b) * af / 255;
        }

        // ── Escolhe caractere ──────────────────────────────────────────────
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
          // Colorido normal: span com a cor RGB real do pixel
          const styleAttr = opacityAttr
            ? `style="color:rgb(${finalR},${finalG},${finalB});${opacityAttr}"`
            : `style="color:rgb(${finalR},${finalG},${finalB})"`;
          line += `<span ${styleAttr}>${esc}</span>`;

        } else if (opacityAttr && !effectiveTone) {
          // Mono com opacity variável (alphaMode=opacity, sem tone fixo)
          line += `<span style="${opacityAttr}">${esc}</span>`;

        } else {
          // Mono puro / tone forçado: sem span, cor herdada do <pre>
          line += esc;
        }
      }

      lines.push(line);
    }

    return lines.join("\n");
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  CARREGAMENTO DE IMAGEM
  // ═══════════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════════
  //  PROCESSA UM ELEMENTO <imgascii>
  // ═══════════════════════════════════════════════════════════════════════════════
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

    // ── Lê atributos — null significa "usar config/default" ───────────────────
    const rawBg = el.getAttribute("bg");
    const rawFs = el.getAttribute("font-size");
    const rawLH = el.getAttribute("line-height");
    const wantsColor = el.hasAttribute("color") ? el.getAttribute("color") === "true" : cfg.color;
    const noColorTag = el.getAttribute("nocolor") === "true";
    const toneTag = el.getAttribute("tone") || cfg.tone || null;
    const alphaMode = el.getAttribute("alpha-mode") || cfg.alphaMode;
    const blendBg = el.getAttribute("blend-bg") || cfg.blendBg;
    const extraClass = el.getAttribute("class") || "";

    // Limites por tag (sobrescreve config global se definido)
    const maxW = el.hasAttribute("max-width") ? parseInt(el.getAttribute("max-width"), 10) : cfg.maxWidth;
    const maxH = el.hasAttribute("max-height") ? parseInt(el.getAttribute("max-height"), 10) : cfg.maxHeight;

    // ── Opções base (intenção original, sem aplicar flags globais) ─────────────
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

    // ── Opções efetivas (aplica flags globais) ─────────────────────────────────
    const effectiveTone = toneTag || _globalTone || null;
    const options = Object.assign({}, baseOptions, {
      color: wantsColor && !noColorTag && !_globalNoColor,
      effectiveTone: effectiveTone,
    });

    // ── Monta o <pre> ──────────────────────────────────────────────────────────
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

    // Aplica regra ::selection se tiver tom definido
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

  // ═══════════════════════════════════════════════════════════════════════════════
  //  RE-RENDERIZA TODOS (ao mudar flags globais)
  // ═══════════════════════════════════════════════════════════════════════════════
  function reRenderAll() {
    const cfg = getConfig();
    _rendered.forEach(({ img, baseOptions, rawBg, rawFs, rawLH }, pre) => {
      const effectiveTone = baseOptions.toneTag || _globalTone || null;
      const opts = Object.assign({}, baseOptions, {
        color: baseOptions.wantsColor && !baseOptions.noColorTag && !_globalNoColor,
        effectiveTone: effectiveTone,
      });

      // Atualiza cor de texto e selection do <pre>
      pre.style.color = effectiveTone || "inherit";
      _aplicarSelection(pre, effectiveTone);

      pre.innerHTML = imageToAscii(img, opts);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //  PROCESSAMENTO E OBSERVAÇÃO DO DOM
  // ═══════════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════════
  //  API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════════
  window.imgascii = {

    /** Reprocessa todos os <imgascii> do DOM. */
    refresh: processAll,

    /** Referência ao objeto de configuração global (leitura/escrita). */
    get config() { return Object.assign({}, DEFAULTS, window.imgasciiConfig || {}); },

    /**
     * Ativa ou desativa cores globalmente. Re-renderiza sem recarregar imagens.
     * @param {boolean} val
     */
    setNoColor: function (val) {
      _globalNoColor = !!val;
      reRenderAll();
    },

    /** Estado atual do flag noColor global. */
    get noColor() { return _globalNoColor; },

    /**
     * Define uma cor CSS global para modo monocromático.
     * Também aplica o ::selection com essa cor (como cor-tags.js faz).
     * @param {string|null} cor — "#f0f" | "red" | "rgb(0,200,100)" | null
     */
    setGlobalTone: function (cor) {
      _globalTone = cor || null;
      reRenderAll();
    },

    /** Tom monocromático global atual. */
    get globalTone() { return _globalTone; },

    /**
     * Converte uma URL de imagem em HTML de arte ASCII.
     * @param {string} url
     * @param {object} [opts]
     * @returns {Promise<string>}
     */
    convert: async function (url, opts = {}) {
      const img = await loadImage(url);
      return imageToAscii(img, opts);
    },

    /**
     * Renderiza arte ASCII num elemento existente do DOM.
     * @param {string|Element} target
     * @param {string} url
     * @param {object} [opts]
     */
    render: async function (target, url, opts = {}) {
      const el = typeof target === "string"
        ? document.querySelector(target)
        : target;
      if (!el) throw new Error(`[imgascii] Elemento não encontrado: ${target}`);
      const img = await loadImage(url);
      el.innerHTML = imageToAscii(img, opts);
    },

    /** Charsets embutidos. */
    charsets: CHARSETS,
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════════════════════════════════════
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { processAll(); observeDom(); });
  } else {
    processAll();
    observeDom();
  }

})();
