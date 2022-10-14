import {
  BaseComponent,
  Utils
} from "VizabiSharedComponents";

import { decorate, computed, observable } from "mobx";

class MCUltraRich extends BaseComponent {

  constructor(config) {
    config.template = ``;

    super(config);
  }

  setup(options) {
    this.DOM = {
      container: this.element,
      bridgeShapeBlur: this.element.append("path").style("fill", "#ccc"),
      bridgeShape: this.element.append("path").style("fill", `url(#vzb-pattern-billy-bridgeshape-${this.parent.name})`).attr("mask", `url(#progFadeMask-${this.parent.name})`),
      circlebox: this.element.append("g"),
      zoombox: this.element.append("g"),
      text: this.element.append("g").attr("class", "vzb-billy-text"),
      defs: this.element.append("defs")
    };
    this.DOM.text.append("text");
    this.DOM.upperbox = this.DOM.zoombox.append("rect").attr("class", "vzb-billy-upperbox");
    this.DOM.lowerbox = this.DOM.zoombox.append("rect").attr("class", "vzb-billy-lowerbox");
    this.DOM.arc = this.DOM.zoombox.append("path").attr("class", "vzb-billy-arc");

    this.DOM.defs.html(`
      <linearGradient id="progFade-${this.parent.name}" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="black"/>
        <stop offset="30%" stop-color="white"/>      
      </linearGradient>
      
      <mask id="progFadeMask-${this.parent.name}" >
        <rect fill="url(#progFade-${this.parent.name})"  />
      </mask>
      

      <pattern id="vzb-pattern-billy-bridgeshape-${this.parent.name}" style="stroke: white; fill: #ccc; stroke-width:10px;" x="0" y="0" patternUnits="userSpaceOnUse" width="25" height="25" viewBox="0 0 500 500"> 
          <circle cx="65" cy="39" r="80" />
          <circle cx="180" cy="-41" r="80" />
          <circle cx="259" cy="54" r="80" />
          <circle cx="364" cy="19" r="80" />
          <circle cx="472" cy="69" r="80" />
          <circle cx="434" cy="189" r="80" />
          <circle cx="427" cy="378" r="80" />
          <circle cx="485" cy="464" r="80" />
          <circle cx="485" cy="268" r="80" />
          <circle cx="65" cy="539" r="80" />
          <circle cx="180" cy="459" r="80" />
          <circle cx="259" cy="554" r="80" />
          <circle cx="364" cy="518" r="80" />
          <circle cx="-66" cy="189" r="80" />
          <circle cx="-45" cy="378" r="80" />
          <circle cx="-14" cy="464" r="80" />
          <circle cx="-14" cy="268" r="80" />
          <circle cx="148" cy="110" r="80" />
          <circle cx="349" cy="139" r="80" />
          <circle cx="243" cy="205" r="80" />
          <circle cx="300" cy="419" r="80" />
          <circle cx="345" cy="291" r="80" />
          <circle cx="130" cy="315" r="80" />
          <circle cx="247" cy="335" r="80" />
          <circle cx="85" cy="129" r="80" />
          <circle cx="122" cy="219" r="80" />
          <circle cx="88" cy="386" r="80" />
          <circle cx="82" cy="150" r="80" />
          <circle cx="-14" cy="464" r="80" />
          <circle cx="-14" cy="-36" r="80" />
          <circle cx="472" cy="569" r="80" />
          <circle cx="-25" cy="69" r="80" />
          <circle cx="-26" cy="569" r="80" />
          <circle cx="30" cy="300" r="80" />
          <circle cx="530" cy="300" r="80" />
        </pattern>
    `)


    this.DOM.defs.append("marker")
      .attr("id", "triangle")
      .attr("viewBox", "0 0 15 10")
      .attr("refX", "15")
      .attr("refY", "5")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "15")
      .attr("markerHeight", "10")
      .attr("orient", "-45deg")
      .html(`<path d="M 0 0 L 15 5 L 0 10 z" fill="grey" stroke="grey"/>`);      

    this.billyMarkerName = options.ultrarichMarkerName;
    this.billyEncName = options.ultrarichEncName;
    this.drilldowns = null;
    this.drilldownsReady = false;
    this.wholeWorld = false;
    this.relevantBilly = new Map();
    this.relevantBillyReady = false;
    this.colorMap = {};
    this.colorMapReady = false;
    this.imagesAvaiable = {};
    this.imagesReady = false;

    
    const start = this.parent.ui.xStart;
    const end = this.parent.ui.xEnd;
    const nbrackets = this.parent.ui.xPoints;
    const step = Math.pow(end/start, 1/nbrackets);
    this.mesh = d3.range(this.parent.ui.billyMeshXPoints).map(m => [start * Math.pow(step, m), start * Math.pow(step, m + 0.5), start * Math.pow(step, m + 1) ]);
    this.bins = this.mesh.map(m => 0);

  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      billyMarker: this.root.model.markers[this.billyMarkerName],
      billyX: this.root.model.markers[this.billyMarkerName].encoding.x,
      billyFrame: this.root.model.markers[this.billyMarkerName].encoding.frame,
      billySlices: this.root.model.markers[this.billyMarkerName].encoding[this.billyEncName],
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    if(!this.parent.ui.showBilly || !this.MDL.billyX.data.concept) return;
    this.addReaction(this.copyframevalue);
    this.addReaction(this.getDrillDowns);
    this.addReaction(this.getRelevantBillies);
    this.addReaction(this.getColorMapping);
    this.addReaction(this.getBillyImages);
    this.addReaction(this.redraw);

    this.addReaction(this.disableReactions);
  }

  disableReactions(){
    if(this.parent.ui.showBilly) return;
    this.removeReaction(this.copyframevalue);
    this.removeReaction(this.getDrillDowns);
    this.removeReaction(this.getRelevantBillies);
    this.removeReaction(this.getColorMapping);
    this.removeReaction(this.getBillyImages);
    this.removeReaction(this.redraw);
    this.DOM.container.selectAll("circle").remove();
    this.DOM.zoombox.classed("vzb-hidden", true);
    this.DOM.text.classed("vzb-hidden", true);
  }

  copyframevalue() {
    this.MDL.billyFrame.config.value = this.localise(this.MDL.frame.value);
  }

  getHardcodedWholeWorldShortcuts(){
    const dim = this.principalDimension;
    const filter = this.model.data.filter.config.dimensions[dim] || false;
    const notFacet = this.model.encoding.facet_row.data.constant === "none";

    return false
      //showing all countries in one chart
      || filter["un_state"] && notFacet
      //showing world as one shape
      || filter["is--global"] && notFacet;
  }

  getDrillDowns() {
    const dim = this.principalDimension;
    const entity = this.parent.atomicSliceData.map(m => m[dim]);
    
    //prevent recalcualaion if list of entities didn't change
    if(this.drilldownsReady == entity.join("")) return;

    this.drilldownsReady = false;
    const drilldownPromise = this.model.data.source.drilldown({dim, entity})
      .then( catalog => {
        if (catalog) {
          const drilldownEntitySet = Object.keys(catalog)[0]; //"country"
          this.drilldowns = catalog[drilldownEntitySet];
        }
      });

    this.wholeWorld = this.getHardcodedWholeWorldShortcuts();
    const isFullEntitySetPromise = this.wholeWorld ? Promise.resolve()
    : this.model.data.isFullEntitySet(dim, entity)
      .then(fullset => {
        this.wholeWorld = fullset;
      });

    Promise.all([drilldownPromise, isFullEntitySetPromise]).then(() => {
      this.drilldownsReady = entity.join("");
    })
  }

  getRelevantBillies() {
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady) return;

    this.relevantBillyReady = false;
    const allBilly = this.MDL.billySlices.data.domainData;
    const billySliceConcept = this.MDL.billySlices.data.concept;
    this.relevantBilly = new Map();
    for(let [, billy] of allBilly) {
      const intersection = d3.intersection(this.drilldowns, billy[billySliceConcept].split(";"));
      if(intersection.size){
        const [firstEntity] = intersection;
        this.relevantBilly.set(billy.person, firstEntity);
      } else {
        this.relevantBilly.delete(billy.person);
      }
    }
    this.relevantBillyReady = true;
  }

  getColorMapping(){
    const dim = this.principalDimension;

    this.colorMapReady = false;
    this.model.data.source.drillupCatalog.then(catalog => {
      const drilldownEntitySet = Object.keys(catalog[dim])[0]; //"country"
      const entities = catalog[dim][drilldownEntitySet].get(Symbol.for("drill_up"));
      for(let [key, entity] of entities) {
        this.colorMap[key] = entity[this.MDL.color.data.concept];
      }
      this.colorMapReady = true;
    });
  }

  getBillyImages(){
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.relevantBillyReady) return;

    if (!this.isShowFaces) return this.imagesReady = true;
    
    this.imagesReady = false;
    const promises = [];
    for (let billy of this._getBillyData()){
      const person = billy.person;

      //this prevents checking and loading the images again for those who have been checked already
      if(this.imagesAvaiable[person] || this.imagesAvaiable[person] === false) continue;

      const reader = this.MDL.billyMarker.data.source.reader;      
      const promise = reader.checkIfAssetExists(person + ".png")
        .then(response => {
          this.imagesAvaiable[person] = response.status === 200 && response.url;

          if(this.imagesAvaiable[person])
            this.DOM.defs.append("pattern")
              .attr("id", "vzb-billy-image-" + person)
              .attr("x", "0%")
              .attr("y", "0%")
              .attr("height", "100%")
              .attr("width", "100%")
              .attr("viewBox", "0 0 100 100")
              .html(`<image x="0%" y="0%" width="100" height="100" xlink:href="${response.url}"></image>`);
        })
        .catch(() => {
          throw ("Billy: error when fetching a portrait for: " + person);
        });

      promises.push(promise);
    }
    Promise.all(promises).then(() => {
      this.imagesReady = true;
    });
  }

  isOutsideOfTimeRange(){
    return this.MDL.billyFrame.scale.domain[0] - this.MDL.frame.value > 0 || this.MDL.frame.value - this.MDL.billyFrame.scale.domain[1] > 0;
  }

  _getBillyData() {     
    const getSortValue = (d) => {
      const colorID = this.colorMap[this.relevantBilly.get(d.person)];
      return this.parent.sortValuesForGroups[colorID] || this.parent.stickySortValues[colorID] || 0;
    }

    this.bins = this.mesh.map(m => 0);
    if (this.isOutsideOfTimeRange())
      return [];
    else
      return d3.shuffle(
        //shuffle for more pleasant distribution within stacked bars
         this.MDL.billyMarker.dataArray
          .filter(f => this.wholeWorld || this.relevantBilly.has(f.person))
          .slice(0, this.parent.ui.howManyBilly)
        )
        //sort billy to follow the colors of stacked mountains
        .sort((a,b) => getSortValue(a) - getSortValue(b))
        .map(this.bin.bind(this));
  }



  bin(d){
    for (let i=0; i<this.mesh.length; i++){
      if (this.mesh[i][0] < d.x && d.x <= this.mesh[i][2]) {
        d.binnedX = this.mesh[i][1];
        d.yInBin = this.bins[i];
        this.bins[i]++;
      }
    } 
    return d;
  }

  get principalDimension() {
    const frameConcept = this.MDL.frame.data.concept;
    return this.model.data.space.filter(f => f !== frameConcept)[0];
  }

  get isShowFaces() {
    return this.parent.ui.howManyBilly < 11 && this.parent.ui.billyFaces;
  }

  redraw() {
    this.services.layout.size; //watch
    this.parent.ui.inpercent;
    this.imagesReady;
    
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.relevantBillyReady || !this.colorMapReady) return;

    const data = this._getBillyData();

    const circleParams = this.redrawCircles(data);
    const zoomboxParams = this.redrawZoombox(circleParams.showZoombox);
    this.redrawBridgeShape(circleParams || {}, zoomboxParams || {});
    this.redrawText(this.isOutsideOfTimeRange());
    
  }

  redrawText(show){
    this.DOM.text
      .classed("vzb-hidden", !show)
      .attr("transform", `translate(${this.parent.xScale.range()[1] - 100}, ${this.parent.yScale.range()[0]}) `)
      .select("text")
      .attr("y", "-3.5em")
      .html(`
        <tspan x="0" dy=".6em">Billionaire data is</tspan>
        <tspan x="0" dy="1.2em">available between</tspan>
        <tspan x="0" dy="1.2em">${this.localise(this.MDL.billyFrame.scale.domain[0])} and ${this.localise(this.MDL.billyFrame.scale.domain[1])}</tspan>
        `)
  }

  redrawBridgeShape({showZoombox, DOT_STEP, DOT_R, PACK_HARDER}, {X,Y,W,H,y,xmax,xmin, gap}) {
    this.DOM.bridgeShape.classed("vzb-hidden", !showZoombox);
    this.DOM.bridgeShapeBlur.classed("vzb-hidden", !showZoombox);

    if (!showZoombox) return;

    // define path generator
    const xScale = this.parent.xScale;
    const yScale = this.parent.yScale;
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(d => y - gap)
      .y1(d => {
        const y1 = d.y * DOT_STEP * 2 + DOT_R * 2;
        return y - gap - (y1 < H ? y1 : H);
      });

    const bridgeShape = this.mesh
      .map((m,i) => ({x: m[1], y: this.bins[i]}))
      //.filter(f => 1000 < f.x && f.x < 100e6);

    const startIndex = this.bins.indexOf(d3.max(this.bins));
      
    for(let i=startIndex; i>0; i--)  bridgeShape[i-1].y = bridgeShape[i].y * 1.2

    this.DOM.defs.select("mask").select("rect")
      .attr("x", X).attr("y", Y).attr("width", W).attr("height", H);
    this.DOM.bridgeShapeBlur
      .attr("d", area(bridgeShape.filter(f => xmin < f.x && f.x < xmax)))
      .style("opacity", this.parent.ui.opacitySelectDim)
    this.DOM.bridgeShape
      .attr("d", area(bridgeShape.filter(f => xmin < f.x && f.x < xmax)))
      .style("opacity", this.parent.ui.opacitySelectDim)

    if (this.parent.atomicSliceData.length === 1){
      const color = this.parent.MDL.color.scale.d3Scale( this.parent.atomicSliceData[0].color );

      this.DOM.bridgeShapeBlur.style("fill", color);
      this.DOM.defs.select("pattern").style("fill", color);
    
    }
    

  }

  redrawZoombox(show) {

    const appearing = this.DOM.upperbox.classed("vzb-hidden") && show;

    this.DOM.zoombox.classed("vzb-hidden", !show);

    if (!show) return;

    const xmin = 1000; //this.mesh[this.bins.findIndex(f => f > 0)][0];
    const xmax = this.mesh.concat().reverse()[this.bins.concat().reverse().findIndex(f => f > 0) - 1][1];
    const W = this.parent.xScale(xmax) - this.parent.xScale(xmin);
    const h = 10;
    const gap = 20;
    const boxHratio = 0.7;
    const H = this.parent.yScale.range()[0] * boxHratio;
    const X = this.parent.xScale(xmin);
    const Y = this.parent.yScale.range()[0] - gap - h - H;
    const y = this.parent.yScale.range()[0] - h;
    
    const upperboxT = this.parent.duration && !appearing
      ? this.DOM.upperbox.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.upperbox.interrupt();

    const lowerboxT = this.parent.duration && !appearing
      ? this.DOM.lowerbox.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.lowerbox.interrupt();

    const arcT = this.parent.duration && !appearing
      ? this.DOM.arc.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.arc.interrupt();      

    upperboxT.attr("x", X).attr("y", Y).attr("width", W).attr("height", H);
    lowerboxT.attr("x", X).attr("y", y).attr("width", W).attr("height", h);
    arcT.attr("d", `M ${X} ${y + h / 2} A ${h} ${2 * h}, 0, 0 1, ${X} ${y - 5 * h}`);

    return ({xmin, xmax, W,H,h,X,Y,y,gap});

    // const index = d3.max(this.parent.atomicSliceData.map(slice => 50 - slice.shape.map(m => this.parent.yScale.range()[0] - this.parent.yScale(m.y)).reverse().findIndex(f => f>=1) ));
    //const namehash = (string) => (+("" + d3.sum(string.split("").map(m=>m.charCodeAt(0)) )).split("").reverse().join("")) % 10 / 10;
    // this.DOM.zoombox.selectAll("line")
    //   .data(this.parent.atomicSliceData).join("line")
    
    //   .style("fill", "transparent")
    //   .style("stroke", d => this.parent.MDL.color.scale.d3Scale(d.color))
    //   .style("stroke-width", "2px")
    //   .style("stroke-linecap","round")
    //   .style("stroke-dasharray", d => 1 + " " + (1 + 20 * namehash(d[Symbol.for("key")]) ))
    //   .attr("x1", this.parent.xScale(this.mesh[index][0]))
    //   .attr("y1", this.parent.yScale.range()[0] - 1.5)
    //   .attr("x2", this.parent.xScale(xmax))
    //   .attr("y2", this.parent.yScale.range()[0] - 1.5)
      
  }


  redrawCircles(data) {
    const _this = this;
    
    const DOT_R = 4;
    const FACE_R = 10;
    const FACEHOVER_R = 50;
    let DOT_STEP = _this.parent.yScale(0) * this.parent.ui.billyYScale / (d3.max(this.bins)||100) / 2;
    if (DOT_STEP > DOT_R) DOT_STEP = DOT_R;
    const PACK_HARDER = DOT_STEP < 2;
   
    const getColor = (d) => this.parent.MDL.color.scale.d3Scale(this.colorMap[this.relevantBilly.get(d.person)]);
    const hasFace = (d) => this.isShowFaces && this.DOM.defs.select(`#vzb-billy-image-${d.person}`).node();
    const getTooltip = (d) => (d.name || d.person).split(";")[0] + " " + _this.localise(d.x) + " $/day";

    const showZoombox = (DOT_STEP < 4 || d3.max(this.bins) > 7) && data.length > 0;

    const circles = this.DOM.circlebox.selectAll("circle")
      .data(data, d => d.person)

    circles.exit().remove();
    circles.enter().append("circle")
      .on("mouseenter", function(event, d){
        _this.parent._setTooltip(event, getTooltip(d));
        if (hasFace(d)) d3.select(this).attr("r", FACEHOVER_R);
      })
      .on("mouseout", function(event, d) {
        _this.parent._setTooltip();
        if (hasFace(d)) d3.select(this).attr("r", FACE_R);
      })
      .merge(circles)
      .style("stroke-opacity", d => hasFace(d) ? 1 : 0.5 )
      .style("stroke", d => hasFace(d) ? getColor(d) : (PACK_HARDER ? "white" : "black") )
      .attr("r", d => hasFace(d) ? FACE_R : DOT_R)
      .style("fill", d => hasFace(d) ? `url(#vzb-billy-image-${d.person})` : getColor(d) )
      .each(function(){
        const view = d3.select(this);

        const transition = _this.parent.duration && view.attr("cy")
          ? view.transition().duration(_this.parent.duration).ease(d3.easeLinear) 
          : view.interrupt();

        transition
          .attr("cy", d => (showZoombox? -30 : 0) + _this.parent.yScale(0) - 1 - (_this.isShowFaces ? FACE_R : DOT_R) - d.yInBin * 2 * (_this.isShowFaces ? FACE_R : DOT_STEP))
          .attr("cx", d => _this.parent.xScale(d.x));
      });

      return {showZoombox, DOT_STEP, DOT_R, PACK_HARDER};
  }


}

const decorated = decorate(MCUltraRich, {
  "MDL": computed,
  "drilldownsReady": observable,
  "relevantBillyReady": observable,
  "billyReady": observable,
  "colorMapReady": observable,
  "imagesReady": observable,
  "isShowFaces": computed,
  "principalDimension": computed,
});
export { decorated as MCUltraRich };
