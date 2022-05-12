//import draggablelist from "components/draggablelist/draggablelist";
import {Dialog} from "VizabiSharedComponents";
import {runInAction, decorate, computed} from "mobx";
import {ICONS} from "./icons.js"
import {PRESETS_DEFAULT} from "./configs-example.js"


function compareConfigs(source, target) {
  let score = 0;
  for (const key in source) {
     if (typeof source[key] === "object" && !Array.isArray(source[key]) && source[key] != null && target[key] != null) {
       score += compareConfigs(source[key], target[key], score);
     } else {
       if (source[key] == target[key]) score++;
     }
  }
  return score;
}


/*
 * Presets dialog
 */
class Presets extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title"> <span data-localise="buttons/presets"></span> </div>
      
        <div class="vzb-dialog-content">
          <div class="vzb-dialog-preset-container">
            <div class="vzb-dialog-addgeo">❇️ Add a geography</div>
            <div class="vzb-dialog-search vzb-hidden">
              <input class="vzb-find-search" type="search" required="" placeholder="Search...">
              <ul></ul>
            </div>
            <div class="vzb-form"></div>
          </div>
        </div>
      </div>
    `;
    config.subcomponents = [];
   
    super(config);
  }

  setup(options) {
    super.setup(options);
    const _this = this;

    this.DOM.container = this.element.select(".vzb-dialog-preset-container");
    this.DOM.form = this.DOM.container.select(".vzb-form").append("form");
    
    this.DOM.addGeo = this.DOM.container.select(".vzb-dialog-addgeo");
    this.DOM.search = this.DOM.container.select(".vzb-dialog-search");
    this.DOM.searchInput = this.DOM.container.select(".vzb-find-search");
    this.DOM.searchList = this.DOM.container.select("ul");

    const PRESETS = this.root.model.config.presets || PRESETS_DEFAULT;

    this.DOM.radioGroups = this.DOM.form.selectAll("fieldset")
      .data(PRESETS).enter().append("fieldset")
      .attr("class", "vzb-radio-svg-group")
      .each(function(d, i){
        d3.select(this)
          .attr("group", i)
          .selectAll("p").data(d)
          .enter().append("p")
          .attr("class", "vzb-radio-svg-item")
          .attr("group", i)
          .each(function(d, i){
            const id = d.icon;
            const view = d3.select(this);

            view.append("input")
              .attr("type", "radio")
              .attr("name", "presets")
              .attr("id", id)
              .attr("value", id);

            view.append("label")
              .attr("for", id)
              .html(ICONS[d.icon])
              .on("click", function(evt, d){ _this.setModel(d.config); })
          })
      })
      .on("mouseover", function(evt) {
        if(evt.shiftKey) _this.updateView(d3.select(this).attr("group"));
      })
      .on("mouseout", function(){
        _this.updateView();
      });

      this.DOM.addGeo
        .on("click", () => {
          _this.DOM.search.classed("vzb-hidden", false);
        })

      this.DOM.searchInput
        .on("keyup", function(){
          _this.search(this.value);
        });

      this.catalog = [];
      this.entitySetsColorScale = d3.scaleOrdinal(d3.schemePastel2);
  }


  get MDL() {
    return {
      color: this.model.encoding["color"]
    }
  }  

  draw(){
    super.draw();
    this.addReaction(this.updateView);
    this.addReaction(this.setGroup);
    this.addReaction(this.buildList);
  }


  buildList(){
    this.model.data.spaceCatalog.then(spaceCatalog => {
      for (const dim in spaceCatalog) {
        if (spaceCatalog[dim].entities) this.catalog = [...spaceCatalog[dim].entities.values()];
      };
    });
  }

  search(string){
    if(!string || string.length < 3) {
      this.DOM.searchList.selectAll("li").remove();
      return;
    }

    const matches = this.catalog.filter(f => f.name.toLowerCase().trim().includes(string.toLowerCase().trim()) || f[Symbol.for("key")].includes(string.toLowerCase().trim()))
      .map(d => {
        d.isness = Object.keys(d).filter(f => f.includes("is--") && d[f]).map(m => {
          return {
            id: m,
            name: this.model.data.source.getConcept(m.replace("is--",""))?.name
          }
        });
        return d;
      })
      .sort((x, y) => d3.ascending(x.isness.map(k => k.id).join(), y.isness.map(k => k.id).join()));
    
    this.DOM.searchList.selectAll("li").remove();
    this.DOM.searchList.selectAll("li")
      .data(matches)
      .enter().append("li")
      .html((d) => {
        return d.name + d.isness.map(m => `<span class="vzb-dialog-isness" style="background-color:${this.entitySetsColorScale(m.id)}">${m.name}</span>`).join("");
      })
      .on("click", (event, d) => {
        this.model.data.filter.addToDimensionsFirstINstatement(d, this.getActiveConfig().loosePath)
        this.DOM.search.classed("vzb-hidden", true);
        this.DOM.searchInput.node().value = "";
      });
  }

  getActiveConfig(){
    const PRESETS = this.root.model.config.presets || PRESETS_DEFAULT;

    PRESETS.flat().forEach(p => {
      p.score = compareConfigs(p.config, this.model.config); 
    })
    const topScore = d3.max(PRESETS.flat(), d => d.score);
    return PRESETS.flat().find(f => f.score === topScore);
  }

  setGroup(){
    const concept = this.MDL.color.data.concept;
    const path = this.getActiveConfig().groupPath;
    if(!path) return;
    const filterConfig = path.reduce((a, p)=>{return a[p]},this.model.config.data.filter.dimensions);
    if (!filterConfig["is--" + concept]) {
      runInAction(() => {
        //clear filter config 
        Object.keys(filterConfig).forEach(k => {if(k.includes("is--")) delete filterConfig[k] });
        //set new filter config
        filterConfig["is--" + concept] = true;        
      });
    }
  }

  updateView(unfoldedRadioGroup){

    const activeConfig = this.getActiveConfig();

    this.DOM.container.selectAll("fieldset").each(function(d, i){
      const fieldset = d3.select(this);
      const fields = fieldset.selectAll("p");
      const nFields = fields.size();

      fields
        .each(function(d){
          const isActive = d.icon == activeConfig.icon;
          d3.select(this).select("input").property("checked", isActive);
          d.selected = isActive;
        })
        .sort((b,a)=>{
          return a.selected - b.selected;
        })
        .order()
        .each(function(d, j){
          const field = d3.select(this);

          const unfold = field.attr("group") === unfoldedRadioGroup;
          const width = 80;
          const spacingH = 10;
          const spacingV = 4;
          const deckEffect = 2;
          const marginLeft = 0;
          const marginTop = 5;
          field
            .style('width', width + "px")
            .style('z-index', nFields - j)
            .transition().duration(100)
            .style("top", marginTop + j * (unfold ? width + spacingV : deckEffect) + "px")
            .style("left", marginLeft + i * (width + spacingH) + j * (unfold ? 0 : deckEffect) + "px");
        })
    })

    this.DOM.addGeo.classed("vzb-hidden", activeConfig.mode !== "show");
  }

  setModel(config){
    const prevConfig = this.getActiveConfig();
    runInAction(() => {
      if(prevConfig.mode === "show" && config.mode === "select") {

      } else if(prevConfig.mode === "select" && config.mode === "show") {

      } else if(prevConfig.mode === "show" && config.mode === "show") {

      }
      this.model.config.data.filter = config.data.filter;
      this.model.config.encoding.stack.data = config.encoding.stack.data;

      config.encoding.facet_row.data.modelType = "entityMembershipDataConfig";
      config.encoding.facet_row.data.space = this.model.config.encoding.facet_row.data.space.slice();

      this.model.config.encoding.facet_row.data = config.encoding.facet_row.data;
    })
  }
}
 
const decorated = decorate(Presets, {
  "MDL": computed
});
Dialog.add("presets", decorated);
export { decorated as Presets };