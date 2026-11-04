module.exports = function (cfg) {
  cfg.addPassthroughCopy("src/admin");
  cfg.addPassthroughCopy("src/img");
  cfg.addPassthroughCopy("src/assets");
  cfg.ignores.add("src/admin/**");

  // Produtos ordenados pela referência
  cfg.addCollection("produtos", (api) =>
    api.getFilteredByGlob("src/produtos/*.md").sort((a, b) =>
      String(a.data.ref).localeCompare(String(b.data.ref), "pt", { numeric: true })
    )
  );

  return { dir: { input: "src", output: "_site" }, markdownTemplateEngine: "njk" };
};
