import {
    BaseComponent,
    Utils
  } from "VizabiSharedComponents";
  
  import {decorate, computed} from "mobx";
  
  class MCUltraRich extends BaseComponent {
  
    constructor(config){
      config.template = ``;
  
      super(config);
    }
  
    setup(options) {
      this.DOM = {
        container: this.element
      };
  
      this.ultrarichMarkerName = options.ultrarichMarkerName;
      this.ultrarichEncName = options.ultrarichEncName;
    }
  
  
    get MDL() {
      return {
        frame: this.model.encoding.frame,
        stack: this.model.encoding.stack,
        ultrarichMarker: this.root.model.markers[this.ultrarichMarkerName]
      };
    }
  
    draw() {
      this.localise = this.services.locale.auto(this.MDL.frame.interval);
      this.addReaction(this.redraw);
      this.addReaction(this._getCatalog);
      this.addReaction(this._copyframevalue);
    }
  
    _isModelReady() {
      return this.MDL.ultrarichMarker.state == Utils.STATUS.READY;
    }

    _getCatalog() {
        this.model.data.spaceCatalog.then(spaceCatalog => {
            console.log(spaceCatalog)
        })
    }
    _copyframevalue(){
        this.MDL.ultrarichMarker.encoding.frame.config.value = 
            this.MDL.frame.value;
    }
  
    redraw(options = {}) {

        if (!this._isModelReady()) return;
        if (this.parent.atomicSliceData.length != 1) return;

        const r = 4;
        const mountain = this.parent.atomicSliceData[0];
        const color = mountain[this.parent._alias("color")];
        
    

        let circles = this.DOM.container.selectAll("circle")
            .data(this.MDL.ultrarichMarker.dataArray
                .filter(f => f.geo == mountain.geo && this.MDL.frame.value - f.time == 0)
                .slice(0, 10), d => d.person);
        circles.join("circle")
            .style("stroke", "black")
            .on("mouseenter", (event,d) => {
                this.parent._setTooltip(event, d.name.split(";")[0]);
                this.parent.runHereOrPossiblyInAllFacets(function(context){
                    context.DOM.xAxis.call(context.xAxis.highlightValue(d.x));
                })
            })
            .on("mouseout", (event,d) => {
                this.parent._setTooltip();
                this.parent.runHereOrPossiblyInAllFacets(function(context){
                    context.DOM.xAxis.call(context.xAxis.highlightValue("none"));
                })
            })
            .attr("cx", d => this.parent.xScale(d.x))
            .attr("cy", d => this.parent.yScale(0) - r)
            .attr("r", r)
            .style("fill", this.parent.MDL.color.scale.d3Scale(color || mountain[Symbol.for("key")] ))

    
    }
  }
  
  const decorated = decorate(MCUltraRich, {
    "MDL": computed
  });
  export { decorated as MCUltraRich };
  