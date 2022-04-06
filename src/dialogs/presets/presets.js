//import draggablelist from "components/draggablelist/draggablelist";
import {Dialog} from "VizabiSharedComponents";
import {runInAction, decorate, computed} from "mobx";
import {ICONS} from "./icons.js"
import {PRESETS} from "./configs.js"

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

    let startTime;
    let endTime;
    let longpress = 1000;

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
              .attr("value", id)
              .property("checked", d.default);

            view.append("label")
              .attr("for", id)
              .html(ICONS[d.icon])
              .on("click", function(evt, d){ _this.setModel(d.config); })
              })
          })

    // this.DOM.inputs = this.DOM.container.selectAll("input")
    //   .on("change", function() {
    //     _this.setModel("stack", d3.select(this).node().value);
    //   });

    // this.DOM.howToMerge = this.element.select(".vzb-howtomerge").selectAll("input")
    //   .on("change", function() {
    //     _this.setModel("merge", d3.select(this).node().value);
    //   });


      // .on('mousedown', function() { startTime = new Date(); })
      // .on('mouseup',function(d) { 
      //     endTime = new Date(); 
      //     if ((endTime - startTime) > longpress) { 
      //         _this.expand(d3.select(this).attr("group"));
      //     }
      //     else {
      //         console.log("regular click, " + (endTime - startTime) + " milliseconds long");
      //     }
      // })

      .on("mouseover", function() {
        _this.expand(d3.select(this).attr("group"));
      })
      .on("mouseout", function(){
        _this.expand();
      });
  }


  get MDL() {
    this.model
  }  

  draw(){
    super.draw();
    this.addReaction(this.updateView);
  }


  updateView() {
    const _this = this;
    this.expand();
  }

  expand(radioGroup){
    this.unfolded = radioGroup;

    this.DOM.container.selectAll("fieldset").each(function(d, i){
      const fieldset = d3.select(this);
      const fields = fieldset.selectAll("p");
      const nFields = fields.size();

      fields.data(Array(nFields).fill("").map(m => ({}) ) )
      fields
        .each(function(f){
          f["selected"] = d3.select(this).select("input").property("checked")
        })
        .sort((b,a)=>{
          return a.selected - b.selected;
        }).order().each(function(d, j){
          const field = d3.select(this);

          const unfold = field.attr("group") === radioGroup;
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