

//import draggablelist from "components/draggablelist/draggablelist";
import {Dialog} from "VizabiSharedComponents";
import {runInAction, decorate, computed} from "mobx";

/*
 * stack dialog
 */
class Stack extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/stack"></span>
        </div>
        
        <div class="vzb-dialog-content">
          <form class="vzb-howtostack vzb-dialog-paragraph">
            <!--p class="vzb-dialog-sublabel" data-localise="hints/mount/howtostack"></p-->
            <label> <input type="radio" name="stack" value="none"> <span data-localise="mount/stacking/none"></span> </label>
            <label> <input type="radio" name="stack" value="bycolor"> <span data-localise="mount/stacking/color"></span> </label>
            <label> <input type="radio" name="stack" value="all" data-localise="mount/stacking/world"> <span data-localise="mount/stacking/world"></span> </label>
          </form>
          
          <form class="vzb-howtomerge vzb-dialog-paragraph">
            <p class="vzb-dialog-sublabel"> <span data-localise="hints/mount/howtomerge"></span></p>
            <label> <input type="radio" name="merge" value="none"> <span data-localise="mount/merging/none"></span> </label>
            <label> <input type="radio" name="merge" value="grouped"> <span data-localise="mount/merging/color"></span> </label>
            <label> <input type="radio" name="merge" value="stacked"> <span data-localise="mount/merging/world"></span> </label>
          </form>
          
          <form class="vzb-manual-sorting">
            <p class="vzb-dialog-sublabel" data-localise="mount/manualSorting"></p>
            <div class="vzb-dialog-draggablelist vzb-dialog-control"></div>
          </form>
        </div>
      </div>
    `;
    config.subcomponents = [
    //   type: DraggableList,
    //   name: "draggablelist",
    //   placeholder: ".vzb-dialog-draggablelist"
    // model: ["state.marker.group", "state.marker.color", "locale", "ui.chart"],
    // groupID: "manualSorting",
    // isEnabled: "manualSortingEnabled",
    // dataArrFn: _this.manualSorting.bind(_this),
    // lang: ""
    ];
   
    super(config);
  }

  setup(options) {
    super.setup(options);
    const _this = this;

    this.DOM.howToStack = this.element.select(".vzb-howtostack").selectAll("input")
      .on("change", function() {
        _this.setModel("stack", d3.select(this).node().value);
      });

    this.DOM.howToMerge = this.element.select(".vzb-howtomerge").selectAll("input")
      .on("change", function() {
        _this.setModel("merge", d3.select(this).node().value);
      });
  }

  get MDL() {
    return {
      color: this.model.encoding.get("color"),
      group: this.model.encoding.get("group"),
      stack: this.model.encoding.get("stack")
    };
  }  

  draw(){
    super.draw();
    this.addReaction(this.updateView);
  }



  ready() {
    if (!this.model.state.marker.color.isDiscrete()) {
      if (this.stack.use == "property") {
        this.setModel("stack", "none");
        return;
      }
      else if (this.group.merge) {
        this.setModel("merge", "none");
        return;
      }
    }
  }

  updateView() {
    const _this = this;

    this.DOM.howToStack
      .property("checked", function() {
        if (d3.select(this).node().value === "none") 
          return _this.MDL.stack.data.constant === "none";
        if (d3.select(this).node().value === "bycolor") 
          return _this.MDL.stack.data.concept === _this.MDL.color.data.concept;
        if (d3.select(this).node().value === "all") 
          return _this.MDL.stack.data.constant === "all";
      })
      .attr("disabled", function() {
        if (d3.select(this).node().value === "none") 
          return null; // always enabled
        if (d3.select(this).node().value === "all") 
          return null; // always enabled
        if (d3.select(this).node().value === "bycolor")
          return _this.MDL.color.data.space.length !== 1 ? true : null;
      });

    //_this.ui.chart.manualSortingEnabled = _this.MDL.stack.data.constant == "all";

    this.DOM.howToMerge
      .property("checked", function() {
        if (d3.select(this).node().value === "none") 
          return !_this.MDL.group.config.merge && !_this.MDL.stack.config.merge;
        if (d3.select(this).node().value === "grouped") 
          return _this.MDL.group.config.merge;
        if (d3.select(this).node().value === "stacked") 
          return _this.MDL.stack.config.merge;
      })
      .attr("disabled", function() {
        if (d3.select(this).node().value === "none") 
          return null; // always enabled
        if (d3.select(this).node().value === "grouped") 
          return _this.MDL.stack.data.constant === "none" || _this.MDL.color.data.space.length !== 1 ? true : null;
        if (d3.select(this).node().value === "stacked") 
          return _this.MDL.stack.data.constant === "all" ? null : true;
      });


  }

  manualSorting(value, persistent = false) {
    if (arguments.length === 0) return this.model.state.marker.group.manualSorting;
    this.model.state.marker.group.set({ manualSorting: value }, false, persistent);
  }

  setModel(what, value) {
    runInAction(() => {

      if (what === "merge") {
        switch (value) {
        case "none":
          this.MDL.group.config.merge = false;
          this.MDL.stack.config.merge = false;
          break;
        case "grouped":
          this.MDL.group.config.merge = true;
          this.MDL.stack.config.merge = false;
          break;
        case "stacked":
          this.MDL.group.config.merge = false;
          this.MDL.stack.config.merge = true;
          break;
        }
      }

      if (what === "stack") {
        switch (value) {
        case "all":
          this.MDL.stack.config.data.concept = null;
          this.MDL.stack.config.data.constant = "all";
          this.MDL.stack.config.data.space = [];
          break;
        case "none":
          this.MDL.stack.config.data.concept = null;
          this.MDL.stack.config.data.constant = "none";
          this.MDL.stack.config.data.space = [];
          
          this.MDL.group.config.merge = false;
          this.MDL.stack.config.merge = false;
          break;
        case "bycolor":
          this.MDL.stack.config.data.constant = null;
          this.MDL.stack.config.data.space = this.MDL.color.config.data.space;
          this.MDL.stack.config.data.concept = this.MDL.color.config.data.concept;
          
          this.MDL.stack.config.merge = false;
          break;
        }
      }

    });
  }
}
 
const decorated = decorate(Stack, {
  "MDL": computed
});
Dialog.add("stack", decorated);
export { decorated as Stack };