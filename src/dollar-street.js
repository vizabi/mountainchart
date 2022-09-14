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
          <pattern class="vzb-noexport" id="vzb-mc-ds-pattern-lines-loading" x="0" y="0" patternUnits="userSpaceOnUse" width="50" height="50" viewBox="0 0 10 10"> 
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
      this.wholeWorld = false;

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
      const countries = this.wholeWorld ? "" : this.drilldowns.map(m => country3to2(m)).filter(f => !!f);
    
      const params = {lng: "en", cols: 6, p: 0, pageSize, topic, featuredOnly: false, countries};
      const u = new URLSearchParams(params).toString().replaceAll("%2C", ",");
      fetch(ENDPOINT + 'search/families?' + u, {
        headers: {Authorization: AUTH_TOKEN}
      })
        .then(resp => resp.json())
        .then(json => {
          this.families = json.hits[6].map(m => ({
            x: +m.place.income/30, 
            id: m.place.slug, 
            name: m.place.name || m.place.slug.replaceAll("-", " "),
            year: m.place?.visitDate?.split("-")[0] || m.place?.date_created?.split("-")[0],
            geo: country2to3(m.place.country.id), 
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
      const iconHeight = 20.5;
      const parentHeight = _this.parent.yScale(0);
  
      const getColor = (d) => this.parent.MDL.color.scale.d3Scale(this.colorMap[d.geo]);
      const outsideTimeRange = (d) => +d.year > this.MDL.frame.value.getUTCFullYear();
  
      const data = this.families;
      this.DOM.container.selectAll("g")
        .data(data, d => d.id)
        .join("g")
        .on("click", function(_, d){
          if (!utils.isTouchDevice()) _this._goToDollarStreet(d);
        })
        .on("mouseenter", function(_, d){
          _this._removeImage();
          _this._addImage(d);
        })
        .on("mouseout", function(event) {
          if (!utils.isTouchDevice() || !d3.select(event.relatedTarget).classed("vzb-mc-ds-image"))
            _this._removeImage();
        })
        .html(icon)
        .style("fill", d => outsideTimeRange(d) ? "#999" : getColor(d))
        .style("opacity", d =>  outsideTimeRange(d) ? 0.2 : null) 
        .style("cursor", "pointer")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .attr("transform", d => "translate("+ _this.parent.xScale(d.x) +"," + (parentHeight - iconHeight) + ") scale(0.5)");
    }

    _goToDollarStreet(d) {
      window.open("https://www.gapminder.org/dollar-street/families/" + d.id, "_blank")
    }

    _removeImage() {
      this.DOM.pattern.selectAll("animateTransform").remove();
      this.DOM.container.selectAll("image").remove();
      this.DOM.container.selectAll(".vzb-mc-ds-text-group").remove();
      this.DOM.container.selectAll(".vzb-mc-ds-image-placeholder").remove();
    }

    _addImage(d){
      const _this = this;
      const height = this.parent.yScale(0);
      const width = d3.max(this.parent.xScale.range());

      const imageSize = height < 360 - 25 ? height - 30 : 360;
      const imageY = (height - imageSize - 25);
      let imageX = this.parent.xScale(d.x) - imageSize/2;
      if (imageX + imageSize > width) imageX = width - imageSize;
      if (imageX < 0) imageX = 0;

      const placeholder = this.DOM.container
        .append("g")
        .attr("class", "vzb-mc-ds-image-placeholder")
        .attr("transform", "translate("+ imageX +"," + imageY + ")")            
      placeholder.append("rect")
        .style("stroke", "black")
        .style("fill", `url(#vzb-mc-ds-pattern-lines-loading)`)
        .attr("width", imageSize)
        .attr("height", imageSize);
      placeholder.append("text")
        .text("loading...")
        .style("text-anchor", "middle")
        .attr("x", imageSize/2)
        .attr("y", imageSize/2);

      this.DOM.pattern.append("animateTransform")
        .attr("attributeType", "xml")
        .attr("attributeName", "patternTransform")
        .attr("type", "rotate")
        .attr("from", "35")
        .attr("to", "395")
        .attr("begin", "0")
        .attr("dur", "60s")
        .attr("repeatCount", "indefinite")

      const imageChoices = imageSize > 180 ? ["image360", "image180", "image80"] : imageSize > 80 ? ["image180", "image80"] : ["image80"];
        
      const tryDownloadImage = (imageChoices) => {
        this.DOM.container.selectAll("image").remove();
        if (!imageChoices[0]) return;

        const img = this.DOM.container
          .append("image")
          .attr("class", "vzb-mc-ds-image")
          .attr("xlink:href", d[imageChoices[0]])
          .attr("transform", "translate("+ imageX +"," + imageY + ")")
          .attr("width", imageSize)
          .attr("height", imageSize)
          .on("click", function(event) {     
            _this._goToDollarStreet(d);
          })
          .on("mouseout", function(event, d) {
            _this._removeImage();
          })

        img.node().addEventListener('load', () => { placeholder.remove() });
        img.node().addEventListener('error', () => { tryDownloadImage(imageChoices.slice(1)) });
      }

      tryDownloadImage(imageChoices);
      
      _this._addTextElements(_this.DOM.container, d, {imageX, imageY, imageSize});
    }

    _addTextElements(container, d, size = {}) {
      const _this = this;

      const group = container.append("g")
        .attr("transform", `translate(${size.imageX}, ${size.imageY})`)
        .attr("class", "vzb-mc-ds-text-group")
        .style("font-size", size.imageSize > 180 ? "1.8em" : size.imageSize > 80 ? "1.24em" : "0.8em");
      
      group.append("text")
        .text(d.name)
        .attr("class", "vzb-mc-ds-name vzb-mc-ds-shadow")
        .attr("dx", "0.5em").attr("dy", "1.5em");
      group.append("text")
        .text(d.name)
        .attr("class", "vzb-mc-ds-name vzb-mc-ds-text")
        .attr("dx", "0.5em").attr("dy", "1.5em");

      group.append("text")
        .text(this.localise(d.x) + " " + this.localise("unit/mountainchart_hardcoded_income_per_day"))
        .attr("class", "vzb-mc-ds-income vzb-mc-ds-shadow")
        .attr("dx", "0.5em").attr("dy", "2.7em");
      group.append("text")
        .text(this.localise(d.x) + " " + this.localise("unit/mountainchart_hardcoded_income_per_day"))
        .attr("class", "vzb-mc-ds-income vzb-mc-ds-text")
        .attr("dx", "0.5em").attr("dy", "2.7em");
      
      group.append("text")
        .text(this.localise("mount/ds/visitThisHome"))
        .attr("class", "vzb-mc-ds-hint vzb-mc-ds-shadow")
        .attr("x", size.imageSize / 2).attr("y", size.imageSize)
        .attr("dy", "-0.8em");
      group.append("text")
        .text(this.localise("mount/ds/visitThisHome"))
        .attr("class", "vzb-mc-ds-hint vzb-mc-ds-text")
        .attr("x", size.imageSize / 2).attr("y", size.imageSize)
        .attr("dy", "-0.8em");

      if(!utils.isTouchDevice()) { 
        group.transition().duration(2000).style("opacity", 0);
      }

      if(utils.isTouchDevice()) {
        group.append("text")
          .text("×")
          .attr("class", "vzb-mc-ds-closecross vzb-mc-ds-shadow")
          .attr("dx", "-1.5em").attr("dy", "1.5em")
          .attr("x", size.imageSize);
          
        group.append("text")
          .text("×")
          .attr("class", "vzb-mc-ds-closecross vzb-mc-ds-text")
          .attr("dx", "-1.5em").attr("dy", "1.5em")
          .attr("x", size.imageSize)
          .on("click",  function(event, d) {
            _this._removeImage();
          });
      }
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
  