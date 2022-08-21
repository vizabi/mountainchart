import {
    BaseComponent,
    Utils,
    LegacyUtils as utils,
  } from "VizabiSharedComponents";
  
  import { decorate, computed, observable } from "mobx";
  
  const AUTH_TOKEN = "";
  const ENDPOINT = "https://api.dollarstreet.org/v1/";



  const COUNTRY_MAPPING = {
    abw: "aw", afg: "af", ago: "ao", aia: "ai", ala: "ax", alb: "al", and: "ad", are: "ae", arg: "ar", arm: "am", asm: "as", ata: "aq", 
    atg: "ag", aus: "au", aut: "at", aze: "az", bdi: "bi", bel: "be", ben: "bj", bfa: "bf", bgd: "bd", bgr: "bg", bhr: "bh", bhs: "bs", 
    bih: "ba", blr: "by", blz: "bz", bmu: "bm", bol: "bo", bouisl: "bv", bra: "br", brb: "bb", brn: "bn", btn: "bt", bwa: "bw", caf: "cf", 
    can: "ca", cck: "cc", che: "ch", chl: "cl", chn: "cn", civ: "ci", cmr: "cm", cod: "cd", cog: "cg", cok: "ck", col: "co", com: "km", 
    cpv: "cv", cri: "cr", cub: "cu", cxr: "cx", cym: "ky", cyp: "cy", cze: "cz", deu: "de", dji: "dj", dma: "dm", dnk: "dk", dom: "do", 
    dza: "dz", ecu: "ec", egy: "eg", eri: "er", esh: "eh", esp: "es", est: "ee", eth: "et", fin: "fi", fji: "fj", flk: "fk", fra: "fr", 
    fra_clipperton: "cp", fro: "fo", fsm: "fm", gab: "ga", gbg: "gg", gbm: "im", gbr: "gb", geo: "ge", gha: "gh", gib: "gi", gin: "gn", 
    glp: "gp", gmb: "gm", gnb: "gw", gnq: "gq", grc: "gr", grd: "gd", grl: "gl", gtm: "gt", guf: "gf", gum: "gu", guy: "gy", heard_a_mcd: "hm", 
    hkg: "hk", hnd: "hn", hos: "va", hrv: "hr", hti: "ht", hun: "hu", idn: "id", ind: "in", iot: "io", irl: "ie", irn: "ir", irq: "iq", 
    isl: "is", isr: "il", ita: "it", jam: "jm", jey: "je", jor: "jo", jpn: "jp", kaz: "kz", ken: "ke", kgz: "kg", khm: "kh", kir: "ki", 
    kna: "kn", kor: "kr", kos: "xk", kwt: "kw", lao: "la", lbn: "lb", lbr: "lr", lby: "ly", lca: "lc", lie: "li", lka: "lk", lso: "ls", 
    ltu: "lt", lux: "lu", lva: "lv", mac: "mo", maf: "mf", mar: "ma", mco: "mc", mda: "md", mdg: "mg", mdv: "mv", mex: "mx", mhl: "mh", 
    mkd: "mk", mli: "ml", mlt: "mt", mmr: "mm", mne: "me", mng: "mn", mnp: "mp", moz: "mz", mrt: "mr", msr: "ms", mtq: "mq", mus: "mu", 
    mwi: "mw", mys: "my", myt: "yt", nam: "na", ncl: "nc", ner: "ne", nfk: "nf", nga: "ng", nic: "ni", niu: "nu", nld: "nl", nld_curacao: "cw", 
    nor: "no", npl: "np", nru: "nr", nzl: "nz", omn: "om", pak: "pk", pan: "pa", pcn: "pn", per: "pe", phl: "ph", plw: "pw", png: "pg", 
    pol: "pl", pri: "pr", prk: "kp", prt: "pt", pry: "py", pse: "ps", pyf: "pf", qat: "qa", reu: "re", rou: "ro", rus: "ru", rwa: "rw", 
    sau: "sa", sdn: "sd", sen: "sn", sgero_a_ssandw: "gs", sgp: "sg", shn: "sh", sjm: "sj", slb: "sb", sle: "sl", slv: "sv", smr: "sm", 
    som: "so", spm: "pm", srb: "rs", ssd: "ss", stbar: "bl", stp: "st", sur: "sr", svk: "sk", svn: "si", swe: "se", swz: "sz", sxm: "sx", 
    syc: "sc", syr: "sy", tca: "tc", tcd: "td", tgo: "tg", tha: "th", tjk: "tj", tkl: "tk", tkm: "tm", tls: "tl", ton: "to", tto: "tt", 
    tun: "tn", tur: "tr", tuv: "tv", twn: "tw", tza: "tz", uga: "ug", ukr: "ua", ury: "uy", usa: "us", usa_minor_out_isl: "um", uzb: "uz", 
    vct: "vc", ven: "ve", vgb: "vg", vir: "vi", vnm: "vn", vut: "vu", wlf: "wf", wsm: "ws", yem: "ye", zaf: "za", zmb: "zm", zwe: "zw"
  };

  const country3to2 = d3.scaleOrdinal().domain(Object.keys(COUNTRY_MAPPING)).range(Object.values(COUNTRY_MAPPING));
  const country2to3 = d3.scaleOrdinal().domain(Object.values(COUNTRY_MAPPING)).range(Object.keys(COUNTRY_MAPPING));

  class MCDollarStreet extends BaseComponent {
  
    constructor(config) {
      config.template = `
        <defs>
          <pattern class="vzb-noexport" id="vzb-mc-pattern-lines-loading" x="0" y="0" patternUnits="userSpaceOnUse" width="50" height="50" viewBox="0 0 10 10"> 
            <path d='M-1,1 l2,-2M0,10 l10,-10M9,11 l2,-2' stroke='black' stroke-width='3' opacity='0.08'/>
          </pattern> 
        </defs>
      `;
  
      super(config);
    }
  
    setup(options) {
      this.DOM = {
        container: this.element,
        pattern: this.element.select("defs").select("pattern")
      };
  
      this.families = [];
      this.familiesReady = false;

      this.drilldowns = null;
      this.drilldownsReady = false;

      this.colorMap = {};
      this.colorMapReady = false;
      
    }
  
  
    get MDL() {
      return {
        frame: this.model.encoding.frame,
        color: this.model.encoding.color,
      };
    }
  
    draw() {
      this.localise = this.services.locale.auto(this.MDL.frame.interval);
      if(!this.parent.ui.dollarstreet) return;
      this.addReaction(this.getFamilies);
      this.addReaction(this.getDrillDowns);
      this.addReaction(this.getColorMapping);
      this.addReaction(this.redraw);
  
      this.addReaction(this.disableReactions);
    }
  
    disableReactions(){
      if(this.parent.ui.dollarstreet) return;
      this.removeReaction(this.getFamilies);
      this.removeReaction(this.getDrillDowns);
      this.removeReaction(this.getColorMapping);
      this.removeReaction(this.redraw);
      this.DOM.container.selectAll("g").remove();
    }
  
  
    get principalDimension() {
      const frameConcept = this.MDL.frame.data.concept;
      return this.model.data.space.filter(f => f !== frameConcept)[0];
    }

    getDrillDowns() {
      const dim = this.principalDimension;
      const entity = this.parent.atomicSliceData.map(m => m[dim]);
      
      if(this.drilldownsReady == entity.join("")) return;
      this.drilldownsReady = false;
      this.model.data.source.drilldown({dim, entity})
        .then( catalog => {
          const drilldownEntitySet = Object.keys(catalog)[0]; //"country"
          this.drilldowns = catalog[drilldownEntitySet];
          this.drilldownsReady = entity.join("");
        });
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

    getFamilies() {
      if(!this.drilldownsReady) return;

      this.familiesReady = false;
      const topic = this.parent.ui.dsTopic || "homes";
      const pageSize = Math.round(+this.parent.ui.dsHowManyHomes);
      const countries = this.drilldowns.map(m => country3to2(m)).filter(f => !!f);
    
      const params = {lng: "en", cols: 6, p: 0, pageSize, topic, featuredOnly: false, countries};
      const u = new URLSearchParams(params).toString().replaceAll("%2C", ",");
      fetch(ENDPOINT + 'search/families?' + u, {
        headers: {Authorization: AUTH_TOKEN}
      })
        .then(resp => resp.json())
        .then(json => {
          console.log(json.hits[6].length)
          this.families = json.hits[6].map(m => ({
            x: +m.place.income/30, 
            id: m.place.slug, 
            geo: country2to3(m.place.country.id), 
            year: m.place.date_created.split("-")[0],
            image360: m.images.cropped360,
            image180: m.images.cropped180,
            image80: m.images.cropped180
          })).sort((a,b) => a.x - b.x);
          this.familiesReady = true;
      })
    }

    redraw() {
      const _this = this;
      this.services.layout.size; //watch
      this.parent.ui.inpercent;
      
      this._removeImage();
      
      if(!this.familiesReady || !this.colorMapReady) return;

      const icon = `<path d="m25 9.0937l-17.719 16.281h5.563v15.531h24.312v-15.531h5.563l-17.719-16.281z"/>`;
  
      const getTooltip = (d) => d.name + " " + _this.localise(d.x) + " $/day";
      const getColor = (d) => this.parent.MDL.color.scale.d3Scale(this.colorMap[d.geo]);
  
      const data = this.families;
      this.DOM.container.selectAll("g")
        .data(data, d => d.id)
        .join("g")
        .on("click", function(event, d){     
          if (!utils.isTouchDevice()) window.open("https://www.gapminder.org/dollar-street/families/" + d.id, "_blank");
        })
        .on("mouseenter", function(event, d){
          _this._removeImage();

          const height = _this.parent.yScale.range()[0];
          const width = _this.parent.xScale.range()[1];

          const imageSize = height < 360 - 25 ? height - 30 : 360;
          const imageY = (height - imageSize - 25);
          let imageX = _this.parent.xScale(d.x) - imageSize/2;
          if (imageX + imageSize > width) imageX = width - imageSize;
          if (imageX < 0) imageX = 0;

          const placeholder = _this.DOM.container
            .append("g")
            .attr("class", "vzb-mc-image-placeholder")
            .attr("transform", "translate("+ imageX +"," + imageY + ")")            
          placeholder.append("rect")
            .style("stroke", "black")
            .style("fill", `url(#vzb-mc-pattern-lines-loading)`)
            .attr("width", imageSize)
            .attr("height", imageSize);
          placeholder.append("text")
            .text("loading...")
            .style("text-anchor", "middle")
            .attr("x", imageSize/2)
            .attr("y", imageSize/2);

          _this.DOM.pattern.append("animateTransform")
            .attr("attributeType", "xml")
            .attr("attributeName", "patternTransform")
            .attr("type", "rotate")
            .attr("from", "35")
            .attr("to", "395")
            .attr("begin", "0")
            .attr("dur", "60s")
            .attr("repeatCount", "indefinite")


          const imageChoice = imageSize > 180 ? "image360" : imageSize > 80 ? "image180" : "image80"
            
          const img = _this.DOM.container
            .append("image")
            .attr("class", "vzb-mc-dollarstreet-image")
            .attr("xlink:href", d[imageChoice])
            .attr("transform", "translate("+ imageX +"," + imageY + ")")
            .attr("width", imageSize)
            .attr("height", imageSize)

          img.node().addEventListener('load', () => { placeholder.remove() });

          if (utils.isTouchDevice()) {
            img.on("click", function(event) {     
              window.open("https://www.gapminder.org/dollar-street/families/" + d.id, "_blank");
            })
            .on("mouseout", function(event, d) {
                _this._removeImage();
            })
    
          }

          if(d.name){
            if (utils.isTouchDevice()) {
              _this._addMobileElements(_this.DOM.container, d, {imageX, imageY, imageSize});
            } else {
              _this.parent._setTooltip(event, getTooltip(d));
            }
          } else {

            fetch(ENDPOINT + "families/" + d.id, {
              headers: {Authorization: AUTH_TOKEN}
            })
            .then(resp => resp.json())
            .then(json => {
              d.name = json.name;
              if (utils.isTouchDevice()) {
                _this._addMobileElements(_this.DOM.container, d, {imageX, imageY, imageSize});
              } else {
                _this.parent._setTooltip(event, getTooltip(d));
              }
            });
          }
          
        })
        .on("mouseout", function(event, d) {
          if (!utils.isTouchDevice()) {
            _this.parent._setTooltip();
            _this._removeImage();
          } else if (!d3.select(event.relatedTarget).classed("vzb-mc-dollarstreet-image")) {
            _this._removeImage();
          }
        })
        .html(icon)
        .style("fill", d => +d.year <= this.MDL.frame.value.getUTCFullYear() ? getColor(d) : "#999")
        .style("opacity", d => +d.year <= this.MDL.frame.value.getUTCFullYear() ? null : 0.2) 
        .style("cursor", "pointer")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .attr("transform", d => "translate("+ _this.parent.xScale(d.x) +"," + (_this.parent.yScale.range()[0] - 20.5) + ") scale(0.5)");
    }

    _removeImage() {
      this.DOM.pattern.selectAll("animateTransform")
        .remove();
      this.DOM.container
        .selectAll("image").remove();
      this.DOM.container
        .selectAll(".vzb-mc-image-mobile-group").remove();
      this.DOM.container
        .selectAll(".vzb-mc-image-placeholder").remove();
    }

    _addMobileElements(container, d, size = {}) {
      const _this = this;

      const group = container.append("g")
        .attr("class", "vzb-mc-image-mobile-group")
        .attr("pointer-events", "none");
      group.append("text")
        .text(d.name)
        .attr("dx", "0.1em")
        .attr("x", size.imageX)
        .attr("dy", "1em")
        .attr("y", size.imageY)
        .attr("style", "fill:white;stroke:white;stroke-opacity:0.7;stroke-width:0.15em");
      group.append("text")
        .text(d.name)
        .attr("dx", "0.1em")
        .attr("x", size.imageX)
        .attr("dy", "1em")
        .attr("y", size.imageY);

      group.append("text")
        .text(this.localise(d.x) + " $/day")
        .attr("dx", "0.1em")
        .attr("x", size.imageX)
        .attr("dy", "2.1em")
        .attr("y", size.imageY)
        .attr("style", "fill:white;stroke:white;stroke-opacity:0.7;stroke-width:0.15em");
      group.append("text")
        .text(this.localise(d.x) + " $/day")
        .attr("dx", "0.1em")
        .attr("x", size.imageX)
        .attr("dy", "2.1em")
        .attr("y", size.imageY);
      
      group.append("text")
        .text("Click to visit this home")
        .attr("text-anchor", "middle")
        .attr("x", size.imageX + size.imageSize*0.5)
        .attr("dy", "-0.2em")
        .attr("y", size.imageY + size.imageSize)
        .attr("style", "fill:white;stroke:white;stroke-opacity:0.7;stroke-width:0.15em");
      group.append("text")
        .text("Click to visit this home")
        .attr("text-anchor", "middle")
        .attr("x", size.imageX + size.imageSize*0.5)
        .attr("dy", "-0.2em")
        .attr("y", size.imageY + size.imageSize);

      group.append("text")
        .text("×")
        .attr("dx", "-1em")
        .attr("x", size.imageX + size.imageSize)
        .attr("dy", "1em")
        .attr("y", size.imageY)
        .attr("style", "fill:white;stroke:white;stroke-opacity:0.7;stroke-width:0.15em");
      group.append("text")
        .text("×")
        .attr("dx", "-1em")
        .attr("x", size.imageX + size.imageSize)
        .attr("dy", "1em")
        .attr("y", size.imageY)
        .attr("pointer-events", "bounding-box")
        .on("click",  function(event, d) {
          _this._removeImage();
        });
    }
  }

  const decorated = decorate(MCDollarStreet, {
    "MDL": computed,
    "familiesReady": observable,
    "drilldownsReady": observable,
    "colorMapReady": observable,
    "principalDimension": computed,
  });
  export { decorated as MCDollarStreet };
  