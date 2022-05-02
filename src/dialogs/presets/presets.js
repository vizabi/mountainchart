//import draggablelist from "components/draggablelist/draggablelist";
import {Dialog} from "VizabiSharedComponents";
import {runInAction, decorate, computed} from "mobx";
import {ICONS} from "./icons.js"
import {PRESETS} from "./configs.js"


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
  }


  get MDL() {
    this.model
  }  

  draw(){
    super.draw();
    this.addReaction(this.updateView);
  }

  getActiveConfig(){
    PRESETS.flat().forEach(p => {
      p.score = compareConfigs(p.config, this.model.config); 
    })
    const topScore = d3.max(PRESETS.flat(), d => d.score);
    return PRESETS.flat().find(f => f.score === topScore);
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
          const marginLeft = 22;
          const marginTop = 5;
          field
            .style('width', width + "px")
            .style('z-index', nFields - j)
            .transition().duration(100)
            .style("top", marginTop + j * (unfold ? width + spacingV : deckEffect) + "px")
            .style("left", marginLeft + i * (width + spacingH) + j * (unfold ? 0 : deckEffect) + "px");
        })
    })
  }

  setModel(config){
    runInAction(() => {
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