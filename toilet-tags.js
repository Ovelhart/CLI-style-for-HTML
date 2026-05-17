const TOILET_OPCOES = {
  tagNome:        "toilet",
  atributoTexto:  "text",
  atributoEstilo: "estilo",
  atributoAlinha: "alinhamento",
  atributoCor:    "cor",
  atributoFonte:  "fonte",
  estiloDefault:  "banner",
  alinhaDefault:  "esquerda",
  corDefault:     "inherit",
  fontSizeDefault:"1rem",
  fontFamily:     "monospace",
  avisoConsole:   true,
};

const TOILET_PALETA = (typeof PALETA !== "undefined" && PALETA) || {
  vermelho:          "#C50F1F",
  verde:             "#13A10E",
  azul:              "#0037DA",
  amarelo:           "#C19C00",
  roxo:              "#881798",
  ciano:             "#3A96DD",
  branco:            "#CCCCCC",
  preto:             "#0C0C0C",
  pretobrilhante:    "#767676",
  azulbrilhante:     "#3B78FF",
  cianobrilhante:    "#61D6D6",
  verdebrilhante:    "#16C60C",
  roxobrilhante:     "#B4009E",
  vermelhobrilhante: "#E74856",
  brancobrilhante:   "#F2F2F2",
  amarelobrilhante:  "#F9F1A5",
};

function _resolverCor(valor) {
  if (!valor) return null;
  const chave = valor.toLowerCase().trim();
  if (TOILET_PALETA[chave]) return TOILET_PALETA[chave];
  return valor.trim();
}

const FONTE_BANNER = (() => {
  const H = "#";
  return {
    "A": [` ${H}${H}${H} `, `${H}   ${H}`, `${H}${H}${H}${H}${H}`, `${H}   ${H}`, `${H}   ${H}`, `     `],
    "B": [`${H}${H}${H}${H} `, `${H}   ${H}`, `${H}${H}${H}${H} `, `${H}   ${H}`, `${H}${H}${H}${H} `, `     `],
    "C": [` ${H}${H}${H}${H}`, `${H}    `, `${H}    `, `${H}    `, ` ${H}${H}${H}${H}`, `     `],
    "D": [`${H}${H}${H}  `, `${H}  ${H} `, `${H}   ${H}`, `${H}  ${H} `, `${H}${H}${H}  `, `     `],
    "E": [`${H}${H}${H}${H}${H}`, `${H}    `, `${H}${H}${H}  `, `${H}    `, `${H}${H}${H}${H}${H}`, `     `],
    "F": [`${H}${H}${H}${H}${H}`, `${H}    `, `${H}${H}${H}  `, `${H}    `, `${H}    `, `     `],
    "G": [` ${H}${H}${H} `, `${H}    `, `${H} ${H}${H}${H}`, `${H}   ${H}`, ` ${H}${H}${H} `, `     `],
    "H": [`${H}   ${H}`, `${H}   ${H}`, `${H}${H}${H}${H}${H}`, `${H}   ${H}`, `${H}   ${H}`, `     `],
    "I": [`${H}${H}${H}`, ` ${H} `, ` ${H} `, ` ${H} `, `${H}${H}${H}`, `   `],
    "J": [`  ${H}${H}${H}`, `    ${H}`, `    ${H}`, `${H}  ${H}`, ` ${H}${H} `, `     `],
    "K": [`${H}  ${H}`, `${H} ${H} `, `${H}${H}  `, `${H} ${H} `, `${H}  ${H}`, `    `],
    "L": [`${H}    `, `${H}    `, `${H}    `, `${H}    `, `${H}${H}${H}${H}${H}`, `     `],
    "M": [`${H}   ${H}`, `${H}${H} ${H}${H}`, `${H} ${H} ${H}`, `${H}   ${H}`, `${H}   ${H}`, `     `],
    "N": [`${H}   ${H}`, `${H}${H}  ${H}`, `${H} ${H} ${H}`, `${H}  ${H}${H}`, `${H}   ${H}`, `     `],
    "O": [` ${H}${H}${H} `, `${H}   ${H}`, `${H}   ${H}`, `${H}   ${H}`, ` ${H}${H}${H} `, `     `],
    "P": [`${H}${H}${H}${H} `, `${H}   ${H}`, `${H}${H}${H}${H} `, `${H}    `, `${H}    `, `     `],
    "Q": [` ${H}${H}${H} `, `${H}   ${H}`, `${H}   ${H}`, `${H}  ${H}${H}`, ` ${H}${H}${H}${H}`, `     `],
    "R": [`${H}${H}${H}${H} `, `${H}   ${H}`, `${H}${H}${H}${H} `, `${H} ${H}  `, `${H}  ${H} `, `     `],
    "S": [` ${H}${H}${H}${H}`, `${H}    `, ` ${H}${H}${H} `, `    ${H}`, `${H}${H}${H}${H} `, `     `],
    "T": [`${H}${H}${H}${H}${H}`, `  ${H}  `, `  ${H}  `, `  ${H}  `, `  ${H}  `, `     `],
    "U": [`${H}   ${H}`, `${H}   ${H}`, `${H}   ${H}`, `${H}   ${H}`, ` ${H}${H}${H} `, `     `],
    "V": [`${H}   ${H}`, `${H}   ${H}`, `${H}   ${H}`, ` ${H} ${H} `, `  ${H}  `, `     `],
    "W": [`${H}   ${H}`, `${H}   ${H}`, `${H} ${H} ${H}`, `${H}${H} ${H}${H}`, `${H}   ${H}`, `     `],
    "X": [`${H}   ${H}`, ` ${H} ${H} `, `  ${H}  `, ` ${H} ${H} `, `${H}   ${H}`, `     `],
    "Y": [`${H}   ${H}`, ` ${H} ${H} `, `  ${H}  `, `  ${H}  `, `  ${H}  `, `     `],
    "Z": [`${H}${H}${H}${H}${H}`, `   ${H} `, `  ${H}  `, ` ${H}   `, `${H}${H}${H}${H}${H}`, `     `],
    "0": [` ${H}${H}${H} `, `${H}  ${H}${H}`, `${H} ${H} ${H}`, `${H}${H}  ${H}`, ` ${H}${H}${H} `, `     `],
    "1": [` ${H}${H} `, `  ${H} `, `  ${H} `, `  ${H} `, `${H}${H}${H}${H}`, `    `],
    "2": [` ${H}${H}${H} `, `${H}   ${H}`, `   ${H} `, `  ${H}  `, `${H}${H}${H}${H}${H}`, `     `],
    "3": [`${H}${H}${H}${H} `, `   ${H} `, ` ${H}${H}${H} `, `   ${H} `, `${H}${H}${H}${H} `, `     `],
    "4": [`${H}  ${H}`, `${H}  ${H}`, `${H}${H}${H}${H}`, `   ${H}`, `   ${H}`, `    `],
    "5": [`${H}${H}${H}${H}${H}`, `${H}    `, `${H}${H}${H}${H} `, `    ${H}`, `${H}${H}${H}${H} `, `     `],
    "6": [` ${H}${H}${H} `, `${H}    `, `${H}${H}${H}${H} `, `${H}   ${H}`, ` ${H}${H}${H} `, `     `],
    "7": [`${H}${H}${H}${H}${H}`, `   ${H} `, `  ${H}  `, ` ${H}   `, `${H}    `, `     `],
    "8": [` ${H}${H}${H} `, `${H}   ${H}`, ` ${H}${H}${H} `, `${H}   ${H}`, ` ${H}${H}${H} `, `     `],
    "9": [` ${H}${H}${H} `, `${H}   ${H}`, ` ${H}${H}${H}${H}`, `    ${H}`, ` ${H}${H}${H} `, `     `],
    " ": [`    `, `    `, `    `, `    `, `    `, `    `],
    "!": [` ${H} `, ` ${H} `, ` ${H} `, `   `, ` ${H} `, `   `],
    "?": [` ${H}${H}${H} `, `${H}   ${H}`, `   ${H} `, `  ${H}  `, `  ${H}  `, `     `],
    ".": [`  `, `  `, `  `, `  `, `${H}${H}`, `  `],
    ",": [`  `, `  `, `  `, ` ${H}`, ` ${H}`, `${H} `],
    "-": [`    `, `    `, `${H}${H}${H}${H}`, `    `, `    `, `    `],
    ":": [`  `, `${H}${H}`, `  `, `${H}${H}`, `  `, `  `],
  };
})();

const FONTE_BIG = (() => {
  return {
    "A": [`  /\\  `, ` /  \\ `, `/----\\`, `|    |`, `      `],
    "B": [`|--\\  `, `|--/  `, `|--\\  `, `|--/  `, `      `],
    "C": [` /---`, `/    `, `|    `, ` \\---`, `     `],
    "D": [`|\\   `, `| \\  `, `|  ) `, `|_/  `, `     `],
    "E": [`|----`, `|--- `, `|    `, `|----`, `     `],
    "F": [`|----`, `|--- `, `|    `, `|    `, `     `],
    "G": [` /---`, `/    `, `| --+`, ` \\--/`, `     `],
    "H": [`|   |`, `|---|`, `|   |`, `|   |`, `     `],
    "I": [`---`, ` | `, ` | `, `---`, `   `],
    "J": [`  ---`, `    |`, `\\   |`, ` \\--/`, `     `],
    "K": [`|  / `, `|-/  `, `|-\\  `, `|  \\ `, `     `],
    "L": [`|    `, `|    `, `|    `, `|----`, `     `],
    "M": [`|\\/|`, `|  |`, `|  |`, `|  |`, `    `],
    "N": [`|\\  |`, `| \\ |`, `|  \\|`, `|   |`, `     `],
    "O": [` /---\\ `, `/     \\`, `|     |`, ` \\---/ `, `       `],
    "P": [`|---\\ `, `|---/ `, `|     `, `|     `, `      `],
    "Q": [` /---\\ `, `/     \\`, `|  .  |`, ` \\--\\/ `, `       `],
    "R": [`|---\\ `, `|---/ `, `| \\   `, `|  \\  `, `      `],
    "S": [` /----`, `/     `, `\\---\\ `, `    / `, `\\----/`],
    "T": [`-----`, `  |  `, `  |  `, `  |  `, `     `],
    "U": [`|   |`, `|   |`, `|   |`, ` \\-/ `, `     `],
    "V": [`\\   /`, ` \\ / `, `  V  `, `     `, `     `],
    "W": [`|   |`, `|   |`, `| | |`, ` \\_/ `, `     `],
    "X": [`\\   /`, ` \\ / `, ` / \\ `, `/   \\`, `     `],
    "Y": [`\\   /`, ` \\ / `, `  |  `, `  |  `, `     `],
    "Z": [`----/`, `   / `, `  /  `, ` /   `, `/----`],
    "0": [` /0\\ `, `/   \\`, `|   |`, `\\   /`, ` \\0/ `],
    "1": [` /|`, `  |`, `  |`, `  |`, `--|`],
    "2": [` /--\\`, `    /`, `   / `, `  /  `, `/----`],
    "3": [`---\\`, `  -/`, `  -\\`, `---/`, `    `],
    "4": [`|  | `, `\\--| `, `   | `, `   | `, `     `],
    "5": [`\\----`, `\\--- `, `    \\`, `----/`, `     `],
    "6": [` /---`, `/    `, `\\--\\ `, `\\--/ `, `     `],
    "7": [`-----`, `    /`, `   / `, `  /  `, `     `],
    "8": [` /\\ `, `(  )`, ` \\/ `, `(  )`, ` /\\ `],
    "9": [` /--\\`, `/   |`, `\\--/|`, `    |`, `    /`],
    " ": [`    `, `    `, `    `, `    `, `    `],
    "!": [`|`, `|`, `|`, ` `, `o`],
    "?": [`/--\\ `, `   / `, `  /  `, `     `, `  o  `],
    ".": [` `, ` `, ` `, `o`, ` `],
    ",": [` `, ` `, ` `, `/`, ` `],
    "-": [`    `, `----`, `    `, `    `, `    `],
    ":": [`o`, ` `, `o`, ` `, ` `],
  };
})();

const FONTE_BLOCK = (() => {
  return {
    "A": [` /\\ `, `/--\\`, `|  |`, `    `],
    "B": [`|-- `, `|-< `, `|-- `, `    `],
    "C": [` /-`, `|  `, `|  `, ` \\-`],
    "D": [`|\\ `, `| )`, `|/ `, `   `],
    "E": [`|--`, `|- `, `|--`, `   `],
    "F": [`|--`, `|- `, `|  `, `   `],
    "G": [` /-`, `| -`, `\\_/`, `   `],
    "H": [`| |`, `|-|`, `| |`, `   `],
    "I": [`-`, `|`, `-`, ` `],
    "J": [` _`, ` |`, `\\|`, `  `],
    "K": [`|/ `, `|< `, `|\\ `, `   `],
    "L": [`|  `, `|  `, `|__`, `   `],
    "M": [`|\\/|`, `|  |`, `|  |`, `    `],
    "N": [`|\\|`, `| |`, `| |`, `   `],
    "O": [` _ `, `/ \\`, `\\_/`, `   `],
    "P": [`|\\ `, `|- `, `|  `, `   `],
    "Q": [` _ `, `/ \\`, `\\_X`, `   `],
    "R": [`|\\ `, `|- `, `| \\`, `   `],
    "S": [`/--`, `\\--`, `  /`, `   `],
    "T": [`___`, ` | `, ` | `, `   `],
    "U": [`| |`, `| |`, `|_|`, `   `],
    "V": [`\\ /`, ` V `, `   `, `   `],
    "W": [`\\ /`, `\\/\\`, `\\ /`, `   `],
    "X": [`\\/`, `/\\`, `  `, `  `],
    "Y": [`\\ /`, ` | `, ` | `, `   `],
    "Z": [`__/`, ` / `, `/__`, `   `],
    "0": [` 0 `, `|0|`, `\\_/`, `   `],
    "1": [`|`, `|`, `|`, ` `],
    "2": [`/\u203e`, `_/`, `/_`, `  `],
    "3": [`\u203e\\`, `-/`, `_\\`, `  `],
    "4": [`|_|`, `  |`, `  |`, `   `],
    "5": [`|\u203e`, `\\-`, `_/`, `  `],
    "6": [` /`, `|-`, `|/`, `  `],
    "7": [`\u203e/`, ` /`, `/  `, `   `],
    "8": [`(8)`, `)8(`, `(8)`, `   `],
    "9": [`/|`, `\\|`, ` |`, `  `],
    " ": [`  `, `  `, `  `, `  `],
    "!": [`!`, `!`, `.`, ` `],
    "?": [`/\u203e`, `_/`, `.  `, `   `],
    ".": [` `, ` `, `.`, ` `],
    ",": [` `, ` `, `/`, ` `],
    "-": [`   `, `---`, `   `, `   `],
    ":": [`.`, ` `, `.`, ` `],
  };
})();

const FONTES_TOILET = {
  banner: { fonte: FONTE_BANNER, alturaLinhas: 6 },
  big:    { fonte: FONTE_BIG,    alturaLinhas: 5 },
  block:  { fonte: FONTE_BLOCK,  alturaLinhas: 4 },
};

const MAPA_ALINHAMENTO = {
  esquerda: "left",
  centro:   "center",
  direita:  "right",
  left:     "left",
  center:   "center",
  right:    "right",
};

function _renderizarTexto(texto, nomeFonte) {
  const config = FONTES_TOILET[nomeFonte] || FONTES_TOILET[TOILET_OPCOES.estiloDefault];
  const { fonte, alturaLinhas } = config;

  const chars = texto.toUpperCase().split("");
  const linhas = Array.from({ length: alturaLinhas }, () => "");

  chars.forEach(ch => {
    const glifo     = fonte[ch] || fonte[" "];
    const glifoNorm = Array.from({ length: alturaLinhas }, (_, i) => glifo[i] ?? "");
    const maxLarg   = Math.max(...glifoNorm.map(l => l.length), 1);

    glifoNorm.forEach((linha, i) => {
      linhas[i] += linha.padEnd(maxLarg, " ") + " ";
    });
  });

  return linhas;
}

function processarToiletTags() {
  const tags = document.querySelectorAll(TOILET_OPCOES.tagNome);

  tags.forEach(tag => {
    const texto      = tag.getAttribute(TOILET_OPCOES.atributoTexto) || "";
    const estiloAttr = (tag.getAttribute(TOILET_OPCOES.atributoEstilo) || TOILET_OPCOES.estiloDefault).toLowerCase().trim();
    const alinhaAttr = (tag.getAttribute(TOILET_OPCOES.atributoAlinha) || TOILET_OPCOES.alinhaDefault).toLowerCase().trim();
    const corAttr    = tag.getAttribute(TOILET_OPCOES.atributoCor)   || "";
    const fonteAttr  = tag.getAttribute(TOILET_OPCOES.atributoFonte) || TOILET_OPCOES.fontSizeDefault;

    if (!FONTES_TOILET[estiloAttr] && TOILET_OPCOES.avisoConsole) {
      console.warn(
        `[toilet-tags] Estilo "${estiloAttr}" desconhecido. ` +
        `Usando "${TOILET_OPCOES.estiloDefault}". ` +
        `Disponíveis: ${Object.keys(FONTES_TOILET).join(", ")}`
      );
    }
    const estiloFinal = FONTES_TOILET[estiloAttr] ? estiloAttr : TOILET_OPCOES.estiloDefault;

    const alignCSS = MAPA_ALINHAMENTO[alinhaAttr] || "left";

    let corFinal = TOILET_OPCOES.corDefault;
    const corResolvida = _resolverCor(corAttr);
    if (corResolvida) {
      corFinal = corResolvida;
    } else {
      let el = tag.parentElement;
      while (el && el !== document.body) {
        if (el.style && el.style.color) { corFinal = el.style.color; break; }
        el = el.parentElement;
      }
    }

    const linhas = _renderizarTexto(texto, estiloFinal);

    const pre = document.createElement("pre");
    pre.style.fontFamily = TOILET_OPCOES.fontFamily;
    pre.style.fontSize   = fonteAttr;
    pre.style.margin     = "0";
    pre.style.padding    = "0";
    pre.style.background = "transparent";
    pre.style.lineHeight = "1.2";
    pre.style.color      = corFinal;
    pre.style.display    = "block";
    pre.style.width      = "100%";
    pre.style.textAlign  = alignCSS;
    pre.style.whiteSpace = "pre";
    pre.style.overflowX  = "auto";

    pre.textContent = linhas.join("\n");

    tag.classList.forEach(cls => pre.classList.add(cls));

    tag.innerHTML     = "";
    tag.style.display = "block";
    tag.appendChild(pre);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", processarToiletTags);
} else {
  processarToiletTags();
}
