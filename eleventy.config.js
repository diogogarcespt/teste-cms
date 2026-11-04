const fs = require("fs");
const path = require("path");

const LANGS = ["pt", "en", "es"];
const lerJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

module.exports = function (cfg) {
  cfg.addPassthroughCopy("site/admin");
  cfg.addPassthroughCopy("site/img");
  cfg.addPassthroughCopy("site/assets");
  cfg.ignores.add("site/admin/**");
  cfg.addWatchTarget("site/conteudo/");

  // Produtos: um ficheiro JSON por produto, com as três línguas
  cfg.addGlobalData("produtos", () => {
    const dir = "site/conteudo/produtos";
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
      const d = lerJSON(path.join(dir, f));
      return { slug: path.basename(f, ".json"), ...d };
    }).sort((a, b) => (a.pt.ordem || 999) - (b.pt.ordem || 999));
  });

  // Textos das páginas
  cfg.addGlobalData("paginas", () => {
    const dir = "site/conteudo/paginas";
    const o = {};
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")))
      o[path.basename(f, ".json")] = lerJSON(path.join(dir, f));
    return o;
  });

  // Combinações produto × língua para gerar as fichas
  cfg.addGlobalData("fichas", () => {
    const dir = "site/conteudo/produtos";
    const out = [];
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const d = lerJSON(path.join(dir, f));
      for (const lang of LANGS) if (d[lang]) out.push({ lang, slug: path.basename(f, ".json"), p: d[lang], todos: d });
    }
    return out;
  });

  cfg.addGlobalData("langs", LANGS);

  cfg.addFilter("gama_por_id", (gamas, id) => gamas.find((g) => g.id === id));
  // Conta produtos de uma gama
  cfg.addFilter("contar_gama", (produtos, lang, id) => produtos.filter((p) => p[lang] && p[lang].gama === id).length);
  // Produtos da mesma gama, exceto o atual
  cfg.addFilter("relacionados", (produtos, lang, gama, slug) => produtos.filter((p) => p[lang] && p[lang].gama === gama && p.slug !== slug).slice(0, 4));

  // Endereço de uma página numa língua: pt na raiz, en/es com prefixo
  cfg.addFilter("url_lang", (sub, lang) => (lang === "pt" ? "" : "/" + lang) + sub);

  return { dir: { input: "site", output: "_site", includes: "_includes", data: "_data" }, markdownTemplateEngine: "njk", htmlTemplateEngine: "njk" };
};
