import {
    BaseComponent,
    Utils
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

  class MCDollarStreet extends BaseComponent {
  
    constructor(config) {
      config.template = ``;
  
      super(config);
    }
  
    setup(options) {
      this.DOM = {
        container: this.element,
      };
  
      this.families = [];
      this.familiesReady = false;
      
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
      this.addReaction(this.redraw);
  
      this.addReaction(this.disableReactions);
    }
  
    disableReactions(){
      if(this.parent.ui.dollarstreet) return;
      this.removeReaction(this.getFamilies);
      this.removeReaction(this.redraw);
      this.DOM.container.selectAll("circle").remove();
    }
  
  
    getFamilies() {
      this.familiesReady = false;
      const topic = this.parent.ui.dsTopic || "homes";

      const params = {lng: "en", cols: 6, p: 0, pageSize: 100, topic, featuredOnly: false, countries: ["in", "lv"]}
      const u = new URLSearchParams(params).toString().replaceAll("%2C", ",");
      fetch(ENDPOINT + 'search/families?' + u, {
        headers: {Authorization: AUTH_TOKEN}
      })
        .then(resp => resp.json())
        .then(json => {
          this.families = json.hits[6].map(m => ({
            x: +m.place.income/30, 
            id: m.place.slug, 
            geo: m.place.country.id, 
            year: m.place.date_created.split("-")[0],
            image: m.images.cropped360
          })).sort((a,b) => a.x - b.x);
          this.familiesReady = true;
      })

  
    }
  

     
    redraw() {
      const _this = this;
      this.services.layout.size; //watch
      this.parent.ui.inpercent;
      
      if(!this.familiesReady) return;
  
      const icon = `<path d="m25 9.0937l-17.719 16.281h5.563v15.531h24.312v-15.531h5.563l-17.719-16.281z"/>`;
  
      const getTooltip = (d) => d.name + " " + _this.localise(d.x) + " $/day";
  
      const data = this.families;
      this.DOM.container.selectAll("g")
        .data(data, d => d.id)
        .join("g")
        .on("click", function(event, d){          
          window.open("https://www.gapminder.org/dollar-street/families/" + d.id, "_blank");
        })
        .on("mouseenter", function(event, d){

          if(d.name){
            _this.parent._setTooltip(event, getTooltip(d));
          } else {

            fetch(ENDPOINT + "families/" + d.id, {
              headers: {Authorization: AUTH_TOKEN}
            })
              .then(resp => resp.json())
              .then(json => {
                d.name = json.name;
                _this.parent._setTooltip(event, getTooltip(d));
            })
          }


          _this.DOM.container
            .append("image")
            .attr("xlink:href",d.image)
            .attr("transform", "translate("+ (_this.parent.xScale(d.x) - 360/2) +"," + (_this.parent.yScale.range()[0] - 360 - 25) + ")")
            .attr("width", 360)
            .attr("height", 360);

          
        })
        .on("mouseout", function(event, d) {
          _this.parent._setTooltip();

          _this.DOM.container
            .selectAll("image").remove();
        })
        .html(icon)
        .style("fill", "yellow")
        .style("cursor", "pointer")
        .style("stroke", "black")
        .style("stroke-width", "2px")
        .attr("transform", d => "translate("+ _this.parent.xScale(d.x) +"," + (_this.parent.yScale.range()[0] - 21) + ") scale(0.5)");
    }
  }
  
  const decorated = decorate(MCDollarStreet, {
    "MDL": computed,
    "familiesReady": observable,
  });
  export { decorated as MCDollarStreet };
  