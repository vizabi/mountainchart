import {Dialog, SimpleCheckbox} from "VizabiSharedComponents";
import {decorate, computed} from "mobx";

/*
 * poverty dialog
 */
class PovertyLine extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/povertyline"></span>
        </div>
    
        <div class="vzb-dialog-content">

          <form class="vzb-dialog-paragraph">
            <div class="vzb-povertyline-show"></div>
          </form>

          <p class="vzb-dialog-sublabel">
            <span data-localise="hints/povertylinetype"></span>
          </p>
        
          <form class="vzb-povertylinetype vzb-dialog-paragraph">
            <!--p class="vzb-dialog-sublabel" data-localise="hints/mount/povertylinetype"></p-->
            <label>
              <input type="radio" name="povertyline" value="extreme">
              <span data-localise="mount/povertyline/extreme"></span>
            </label>
            <label>
              <input type="radio" name="povertyline" value="national">
              <span data-localise="mount/povertyline/national"></span>
            </label>
            <label>
              <input type="radio" name="povertyline" value="custom">
              <span data-localise="mount/povertyline/custom"></span>
            </label>
            <div>
              <input type="text" class="vzb-povertylinecustomvalue-field" name="povertylinecustomvalue"/>
              <span data-localise="hints/povertylinecustomvaluedescr"></span>
            </div>
          </form>

          <p class="vzb-dialog-sublabel">
            <span data-localise="hints/povertylinedetails"></span>
          </p>

          <form class="vzb-dialog-paragraph">
            <div class="vzb-povertyline-below-perc"></div>
            <div class="vzb-povertyline-below"></div>
            <div class="vzb-povertyline-above-perc"></div>
            <div class="vzb-povertyline-above"></div>
          </form>


        </div>
      </div>
    `;
    config.subcomponents = [
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-povertyline-show",
        options: {
          checkbox: "showProbeX",
          submodel: "root.ui.chart"
        }
      },
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-povertyline-below-perc",
        options: {
          checkbox: "belowProc",
          submodel: "root.ui.chart.probeXDetails"
        }
      },
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-povertyline-below",
        options: {
          checkbox: "belowCount",
          submodel: "root.ui.chart.probeXDetails"
        }
      },
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-povertyline-above-perc",
        options: {
          checkbox: "aboveProc",
          submodel: "root.ui.chart.probeXDetails"
        }
      },
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-povertyline-above",
        options: {
          checkbox: "aboveCount",
          submodel: "root.ui.chart.probeXDetails"
        }
      }
    ]

    super(config);
  }

  setup(options) {
    super.setup(options);
    const _this = this;

    this.DOM.customPovertyLineValue = this.element.select(".vzb-povertylinecustomvalue-field");
    this.DOM.povertyLineType = this.element.select(".vzb-povertylinetype").selectAll("input")
      .on("change", function() {
        _this.setPovetryLineType(d3.select(this).node().value);
      });
  
    this.DOM.customPovertyLineValue
      .on("keypress", function(event) {
        if (event.charCode == 13 || event.keyCode == 13) {
          //this prevents form submission action with subsequent page reload
          event.preventDefault();
          this.blur();
        }
      })
      .on("change", function() {
        if (/^\d+\.*\d*$/.test(this.value)) {
          _this.root.ui.chart.probeXCustom = this.value;
        } else {
          this.value = _this.root.ui.chart.probeXCustom;
        }
      });
  
  }

  get MDL() {
    return {

    };
  }  

  draw(){
    this.localise = this.services.locale.auto();
    super.draw();

    this.addReaction(this.updateCustomPovertyLineValue);
    this.addReaction(this.updateView);
  }

  updateCustomPovertyLineValue() {
    this.DOM.customPovertyLineValue.property("value",
      this.localise(this.root.ui.chart.probeXCustom));
  }

  updateView() {
    const _this = this;
    this.DOM.povertyLineType.property("checked", function() {
      return this.value === _this.root.ui.chart.probeXType;
    });
  }

  setPovetryLineType(value) {
    this.root.ui.chart.probeXType = value;
  }
}

const decorated = decorate(PovertyLine, {
  "MDL": computed
});
Dialog.add("povertyline", decorated);
export { decorated as PovertyLine };
