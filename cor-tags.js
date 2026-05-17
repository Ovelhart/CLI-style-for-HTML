const PALETA = {
  vermelho:         "#C50F1F",
  verde:            "#13A10E",
  azul:             "#0037DA",
  amarelo:          "#C19C00",
  roxo:             "#881798",
  ciano:            "#3A96DD",
  branco:           "#CCCCCC",
  preto:            "#0C0C0C",
  pretobrilhante:   "#767676",
  azulbrilhante:    "#3B78FF",
  cianobrilhante:   "#61D6D6",
  verdebrilhante:   "#16C60C",
  roxobrilhante:    "#B4009E",
  vermelhobrilhante:"#E74856",
  brancobrilhante:  "#F2F2F2",
  amarelobrilhante: "#F9F1A5",
};

const OPCOES = {
  tagNome:      "cor",
  atributo:     "tom",
  corPadrao:    "#ff4444",
  avisoConsole: true,
  selectionTextoCor: null,
};

function _obterStyleSheet() {
  const ID = "__cor-tags-styles__";
  let style = document.getElementById(ID);
  if (!style) {
    style = document.createElement("style");
    style.id = ID;
    document.head.appendChild(style);
  }
  return style.sheet;
}

function _hexParaRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3
    ? h.split("").map(c => c + c).join("")
    : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function _luminancia([r, g, b]) {
  const c = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function _corTextoSelection(hexFundo) {
  if (OPCOES.selectionTextoCor) return OPCOES.selectionTextoCor;
  return _luminancia(_hexParaRgb(hexFundo)) > 0.35 ? "#111111" : "#ffffff";
}

const _classesRegistradas = new Set();

function _registrarSelectionRule(sheet, nomeTom, hexFundo) {
  const classe = `ct-${nomeTom}`;
  if (_classesRegistradas.has(classe)) return classe;

  const textoSel = _corTextoSelection(hexFundo);
  const regra =
    `.${classe}::selection { background-color: ${hexFundo}; color: ${textoSel}; }`;

  try {
    sheet.insertRule(regra, sheet.cssRules.length);
  } catch (e) {
    const styleEl = document.getElementById("__cor-tags-styles__");
    if (styleEl) styleEl.textContent += regra;
  }

  _classesRegistradas.add(classe);
  return classe;
}

function processarCorTags() {
  const sheet = _obterStyleSheet();
  const tags  = document.querySelectorAll(OPCOES.tagNome);

  tags.forEach(tag => {
    const tom = tag.getAttribute(OPCOES.atributo)?.toLowerCase().trim();
    const cor = PALETA[tom];

    if (!cor) {
      if (OPCOES.avisoConsole) {
        console.warn(
          `[cor-tags] Tom "${tom}" não encontrado na paleta. ` +
          `Usando cor padrão (${OPCOES.corPadrao}). ` +
          `Tons disponíveis: ${Object.keys(PALETA).join(", ")}`
        );
      }
      tag.style.color = OPCOES.corPadrao;

      const classe = _registrarSelectionRule(sheet, "padrao", OPCOES.corPadrao);
      tag.classList.add(classe);
    } else {
      tag.style.color = cor;

      const classe = _registrarSelectionRule(sheet, tom, cor);
      tag.classList.add(classe);
    }

    tag.style.display = "inline";
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", processarCorTags);
} else {
  processarCorTags();
}
