//import draggablelist from "components/draggablelist/draggablelist";
import {
  Dialog,
  Utils,
  LegacyUtils as utils,
} from "@vizabi/shared-components";
import {runInAction, decorate, computed, toJS} from "mobx";
import {ICONS} from "./icons.js";
import {PRESETS_DEFAULT} from "./configs-example.js";
import * as d3 from "d3";


function followPath(base, path, createMissingObj = false){
  return path.reduce((a, p)=>{
    if (a == null) return null;

    if (Array.isArray(a) && !createMissingObj && (a.length <= p || a[p] == null))
      return null;    

    if (createMissingObj && a[p] == null) a[p] = {};
    
    return a[p];
  }, base);
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

    const PRESETS = toJS(this.root.model.config.presets) || PRESETS_DEFAULT;

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
          .each(function(d){
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
              .on("click", function(evt, d){ _this.setModel(d); });
          });
      })
      .on("mouseover", function(evt) {
        if(evt.shiftKey) _this.updateView(d3.select(this).attr("group"));
      })
      .on("mouseout", function(){
        _this.updateView();
      });
  }


  get MDL() {
    return {
      color: this.model.encoding["color"]
    };
  }  

  draw(){
    super.draw();
    this.addReaction(this.updateView);
    this.addReaction(this.setFilterToMatchColorConcept);
  }


  get activePreset(){
    const PRESETS = toJS(this.root.model.config.presets) || PRESETS_DEFAULT;

    PRESETS.flat().forEach(p => {
      p.score = Utils.computeObjectsSimilarityScore(p.config, toJS(this.model.config), "is--"); 
    });      
    const topScore = d3.max(PRESETS.flat(), d => d.score);
    return PRESETS.flat().find(f => f.score === topScore);
  }

  setFilterToMatchColorConcept(){
    const concept = this.MDL.color.data.concept;
    const path = this.activePreset.groupPath;
    if(!path) return;
    const filterConfig = followPath(this.model.config.data.filter.dimensions, path);

    if (!filterConfig["is--" + concept]) {
      runInAction(() => {
        //clear filter config 
        Object.keys(filterConfig).forEach(k => {if(k.includes("is--")) delete filterConfig[k]; });
        //set new filter config
        filterConfig["is--" + concept] = true;        
      });
    }
  }

  updateView(unfoldedRadioGroup){

    const activeConfig = this.activePreset;

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
            .style("width", width + "px")
            .style("z-index", nFields - j)
            .transition().duration(100)
            .style("top", marginTop + j * (unfold ? width + spacingV : deckEffect) + "px")
            .style("left", marginLeft + i * (width + spacingH) + j * (unfold ? 0 : deckEffect) + "px");
        });
    });

  }

  setModel(target){
    const source = this.activePreset;
    runInAction(() => {
      target = utils.deepClone(target);

      if(source.mode === "show" && target.mode === "select") {
        
        const show = (followPath(this.model.config.data.filter.dimensions, source.loosePath) || []).filter(f => !!f);
        this.model.encoding.selected.data.filter.clear();
        this.model.encoding.selected.data.filter.set(show);

      } else if(source.mode === "select" && target.mode === "show") {
        if(this.model.encoding.selected.data.filter.any()) {
          const $in = target.loosePath.pop();
          const show = followPath(target.config.data.filter.dimensions, target.loosePath, true);
          show[$in] = [...this.model.encoding.selected.data.filter.markers.keys()];
          //clear select
          this.model.encoding.selected.data.filter.clear();
        }
      } else if(source.mode === "show" && target.mode === "show") {
        const $in = target.loosePath.pop();
        const show1 = followPath(this.model.config.data.filter.dimensions, source.loosePath);
        const show2 = followPath(target.config.data.filter.dimensions, target.loosePath, true);

        if(show1) {
          show2[$in] = [...show1];
          this.model.encoding.selected.data.filter.clear();
        }

      } else if(source.mode === "none" || target.mode === "none") {
        //clear select
        this.model.encoding.selected.data.filter.clear();
      }
      this.model.config.data.filter = target.config.data.filter;

      delete this.model.config.encoding.stack.data.constant;
      delete this.model.config.encoding.stack.data.concept;
      delete this.model.config.encoding.stack.data.space;
      delete this.model.config.encoding.stack.data.source;
      this.model.config.encoding.stack.data = target.config.encoding.stack.data;

      delete this.model.config.encoding.order.data.constant;
      delete this.model.config.encoding.order.data.concept;
      delete this.model.config.encoding.order.data.space;
      delete this.model.config.encoding.order.data.source;
      this.model.config.encoding.order.data = target.config.encoding.order.data;

      target.config.encoding.facet_row.data.modelType = "entityMembershipDataConfig";
      delete this.model.config.encoding.facet_row.data.constant;
      delete this.model.config.encoding.facet_row.data.concept;
      delete this.model.config.encoding.facet_row.data.space;
      delete this.model.config.encoding.facet_row.data.source;
      delete this.model.config.encoding.facet_row.data.exceptions;

      this.model.config.encoding.facet_row.data = target.config.encoding.facet_row.data;
    });
  }
}
 
const decorated = decorate(Presets, {
  "MDL": computed,
  "activePreset": computed
});
Dialog.add("presets", decorated);
export { decorated as Presets };