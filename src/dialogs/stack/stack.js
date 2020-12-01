

//import draggablelist from "components/draggablelist/draggablelist";

import {
  //BaseComponent,
  //Icons,
  //Utils,
  //LegacyUtils as utils,
  //axisSmart,
  //DynamicBackground,
  //Exporter as svgexport,
  Dialog
} from "VizabiSharedComponents";

/*
 * stack dialog
 */
export class Stack extends Dialog {

  constructor(config){
    config.tempate = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/stack"></span>
        </div>
        
        <div class="vzb-dialog-content">
            
            <!--p class="vzb-dialog-sublabel" data-localise="hints/mount/howtostack"></p-->
            <form class="vzb-howtostack vzb-dialog-paragraph">
                <label> <input type="radio" name="stack" value="none" data-localise="mount/stacking/none"></label>
                <label> <input type="radio" name="stack" value="bycolor" data-localise="mount/stacking/color"></label>
                <label> <input type="radio" name="stack" value="all" data-localise="mount/stacking/world"></label>
            </form>
            
            <form class="vzb-howtomerge vzb-dialog-paragraph">
                <p class="vzb-dialog-sublabel" data-localise="hints/mount/howtomerge"></p>
                <label> <input type="radio" name="merge" value="none" data-localise="mount/merging/none"></label>
                <label> <input type="radio" name="merge" value="grouped" data-localise="mount/merging/color"></label>
                <label> <input type="radio" name="merge" value="stacked" data-localise="mount/merging/world"></label>
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
    const _this = this;

    this.DOM = {
      howToStack: this.element.select(".vzb-howtostack").selectAll("input"),
      howToMerge: this.element.select(".vzb-howtomerge").selectAll("input")
    };

    this.DOM.howToStack
      .on("change", function() {
        _this.setModel("stack", d3.select(this).node().value);
      });
    this.DOM.howToMerge
      .on("change", function() {
        _this.setModel("merge", d3.select(this).node().value);
      });
  }

  draw(){
    this.MDL = {
      color: this.model.encoding.get("color"),
      group: this.model.encoding.get("group"),
      stack: this.model.encoding.get("stack")
    };

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
          return _this.MDL.color.data.space.length == 1 ? true : null;
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
          return _this.MDL.stack.data.constant === "none" || _this.MDL.color.data.space.length == 1 ? true : null;
        if (d3.select(this).node().value === "stacked") 
          return _this.MDL.stack.data.constant === "all" ? null : true;
      });


  }

  manualSorting(value, persistent = false) {
    if (arguments.length === 0) return this.model.state.marker.group.manualSorting;
    this.model.state.marker.group.set({ manualSorting: value }, false, persistent);
  }

  setModel(what, value) {

    const obj = { stack: {}, group: {} };

    if (what === "merge") {
      switch (value) {
      case "none":
        obj.group.merge = false;
        obj.stack.merge = false;
        break;
      case "grouped":
        obj.group.merge = true;
        obj.stack.merge = false;
        break;
      case "stacked":
        obj.group.merge = false;
        obj.stack.merge = true;
        break;
      }
    }
    if (what === "stack") {

      switch (value) {
      case "all":
        obj.stack.use = "constant";
        obj.stack.which = "all";
        break;
      case "none":
        obj.stack.use = "constant";
        obj.stack.which = "none";
        break;
      case "bycolor":
        obj.stack.use = "property";
        obj.stack.which = this.model.state.marker.color.which;
        obj.stack.spaceRef = this.model.state.marker.color.spaceRef;
        break;
      }

      //validate possible merge values in group and stack hooks
      if (value === "none" && this.group.merge) obj.group.merge = false;
      if (value !== "all" && this.stack.merge) obj.stack.merge = false;
    }

    this.model.state.marker.set(obj);
  }
}


Dialog.add("stack", Stack);